import * as Sentry from '@sentry/node'
import { Task } from 'graphile-worker'
import Dispatcher from '../../fulfillment/dispatcher'
import { getDefiLammaPrice } from '../../operations/pricingOperations'
import networks from '@unlock-protocol/networks'

const MIN_BALANCE = 50

export const checkBalances: Task = async () => {
  // Look for balnces for all purchasers, trigger if they are below a threashold.
  const fulfillmentDispatcher = new Dispatcher()
  const balances = await fulfillmentDispatcher.balances()
  console.log(balances)
  Object.keys(balances).forEach(async (network) => {
    // Get the balance in USD
    const balance = balances[network].balance
    const usdPricing = await getDefiLammaPrice({
      network: parseInt(network, 10),
    })
    if (!usdPricing.price) {
      // We can't get a $ price for this network, so we can't check the balance
      return
    }
    if (usdPricing.price! * balance < MIN_BALANCE) {
      Sentry.captureMessage(
        `Insufficient balance for network ${network} (${networks[network].name})`
      )
    }
  })

  Sentry.captureException(new Error('custom error'))
}
