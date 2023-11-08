import AuthorizedLockOperations from './authorizedLockOperations'
import { getStripeConnectForLock } from './stripeOperations'
import Dispatcher from '../fulfillment/dispatcher'
import { MIN_PAYMENT_STRIPE_CREDIT_CARD } from '../utils/constants'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as lockSettingOperations from './lockSettingOperations'
import * as pricingOperations from './pricingOperations'

/**
 * Check if credit card is enabled for a specific lock
 */
interface CreditCardStateProps {
  lockAddress: string
  network: number
}

// Function that checks if card is enabled for a lock
// This function does several checks that are expensive
// so we have doing them in parallel and try to "fail early"
export const getCreditCardEnabledStatus = async ({
  lockAddress,
  network,
}: CreditCardStateProps): Promise<boolean> => {
  const fulfillmentDispatcher = new Dispatcher()

  // Checks ths DB + Stripe's API, but this should fail the most often
  const { stripeEnabled } = await getStripeConnectForLock(lockAddress, network)
  if (!stripeEnabled) {
    return false
  }

  // This does on an onchain check, but should fail rarely
  const hasEnoughToPayForGas =
    await fulfillmentDispatcher.hasFundsForTransaction(network)
  if (!hasEnoughToPayForGas) {
    return false
  }

  // Check if the lock has authorized credit card payments
  // get the total price in cents
  const [isAuthorizedForCreditCard, totalPriceInCents] = await Promise.all([
    AuthorizedLockOperations.hasAuthorization(lockAddress, network),
    getTotalPriceToChargeInCentsForLock({
      lockAddress,
      network,
    }),
  ])

  const creditCardEnabled =
    isAuthorizedForCreditCard &&
    totalPriceInCents > MIN_PAYMENT_STRIPE_CREDIT_CARD

  return creditCardEnabled
}

const getTotalPriceToChargeInCentsForLock = async ({
  network,
  lockAddress,
}: CreditCardStateProps) => {
  const web3Service = new Web3Service(networks)

  // First check if we have a custom price, and return it if we do!
  const settingsPricing = await lockSettingOperations.getSettings({
    lockAddress,
    network,
  })
  if (settingsPricing?.creditCardPrice) {
    return settingsPricing.creditCardPrice // this price is already in cents
  }

  // Get the lock's price + currency
  const lock = await web3Service.getLock(lockAddress, network, {
    fields: ['keyPrice', 'currencyContractAddress'],
  })
  // get lock's settings and convert price to $
  const defiLammaPricing = await pricingOperations.getDefiLammaPrice({
    network,
    erc20Address: lock.currencyContractAddress,
    amount: Number(`${lock.keyPrice}`),
  })
  return (defiLammaPricing.priceInAmount ?? 0) * 100
}
