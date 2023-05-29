import AuthorizedLockOperations from './authorizedLockOperations'
import { getStripeConnectForLock } from './stripeOperations'
import Dispatcher from '../fulfillment/dispatcher'
import { MIN_PAYMENT_STRIPE_CREDIT_CARD } from '../utils/constants'

/**
 * Check if credit card is enabled for a specific lock
 */
interface CreditCardStateProps {
  lockAddress: string
  network: number
  totalPriceInCents: number
}
export const getCreditCardEnabledStatus = async ({
  lockAddress,
  network,
  totalPriceInCents,
}: CreditCardStateProps): Promise<boolean> => {
  const fulfillmentDispatcher = new Dispatcher()

  const [hasEnoughToPayForGas, { stripeEnabled }, isAuthorizedForCreditCard] =
    await Promise.all([
      fulfillmentDispatcher.hasFundsForTransaction(network),
      getStripeConnectForLock(lockAddress, network),
      AuthorizedLockOperations.hasAuthorization(lockAddress, network),
    ])

  const creditCardEnabled =
    hasEnoughToPayForGas &&
    isAuthorizedForCreditCard &&
    stripeEnabled &&
    totalPriceInCents > MIN_PAYMENT_STRIPE_CREDIT_CARD // Let's check that the price is larger than 50cts

  return creditCardEnabled
}
