import * as Sentry from '@sentry/node'
import { Task } from 'graphile-worker'
import {
  getAllPurchasers,
  getProviderForNetwork,
} from '../../fulfillment/dispatcher'
import { getDefiLlamaPrice } from '../../operations/pricingOperations'
import networks from '@unlock-protocol/networks'
import logger from '../../logger'
import { ethers } from 'ethers'
import { isProduction } from '../../config/config'

const MIN_BALANCE = 50

export const checkBalances: Task = async () => {
  // Look for balnces for all purchasers, trigger if they are below a threashold.
  const networksToCheck = Object.values(networks)
    .filter((network) => network.name !== 'localhost')
    .filter((network) => isProduction || network.isTestNetwork)
  for (let i = 0; i < networksToCheck.length; i++) {
    const network = networksToCheck[i]
    const [provider, purchasers] = await Promise.all([
      getProviderForNetwork(network.id),
      getAllPurchasers({ network: network.id }),
    ])
    for (let j = 0; j < purchasers.length; j++) {
      const purchaser = purchasers[j]
      const address = await purchaser.getAddress()
      const balance = ethers.formatEther(await provider.getBalance(address))
      const usdPricing = await getDefiLlamaPrice({
        network: network.id,
      })
      if (!usdPricing.price) {
        // We can't get a $ price for this network, so we can't check the balance
        logger.info(
          `Missing price conversion for ${network.name}. Can't compare balance.`
        )
        return
      }
      const balanceInUSD = usdPricing.price! * parseFloat(balance)
      if (balanceInUSD < MIN_BALANCE) {
        const message = `Insufficient balance (${balanceInUSD}) for ${address} for network ${network.id} (${network.name})`
        logger.warn(message)
        Sentry.captureMessage(message, 'warning')
      }
    }
  }
}
