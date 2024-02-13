import * as Sentry from '@sentry/node'
import { Task } from 'graphile-worker'
import {
  getAllPurchasers,
  getProviderForNetwork,
} from '../../fulfillment/dispatcher'
import { getDefiLammaPrice } from '../../operations/pricingOperations'
import networks from '@unlock-protocol/networks'
import logger from '../../logger'
import { ethers } from 'ethers'

const MIN_BALANCE = 50

export const checkBalances: Task = async () => {
  // Look for balnces for all purchasers, trigger if they are below a threashold.
  Object.values(networks)
    .filter((network) => network.name !== 'localhost')
    .map(async (network: any) => {
      try {
        const [provider, purchasers] = await Promise.all([
          getProviderForNetwork(network.id),
          getAllPurchasers({ network: network.id }),
        ])
        purchasers.forEach(async (purchaser) => {
          const address = await purchaser.getAddress()
          const balance = ethers.utils.formatEther(
            await provider.getBalance(address)
          )
          const usdPricing = await getDefiLammaPrice({
            network: parseInt(network.id, 10),
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
        })
      } catch (error) {
        logger.error(
          `Error checking balance for network ${network.name}`,
          error
        )
      }
    })
}
