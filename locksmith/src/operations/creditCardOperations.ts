import AuthorizedLockOperations from './authorizedLockOperations'
import { getStripeConnectForLock } from './stripeOperations'
import Dispatcher from '../fulfillment/dispatcher'

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
}: CreditCardStateProps) => {
  const fulfillmentDispatcher = new Dispatcher()

  const [hasEnoughToPayForGas, stripeConnected, isAuthorizedForCreditCard] =
    await Promise.all([
      fulfillmentDispatcher.hasFundsForTransaction(network),
      getStripeConnectForLock(lockAddress, network),
      AuthorizedLockOperations.hasAuthorization(lockAddress, network),
    ])

  const hasStripeConfig = stripeConnected != 0 && stripeConnected != -1

  return (
    hasEnoughToPayForGas &&
    isAuthorizedForCreditCard &&
    hasStripeConfig &&
    totalPriceInCents > 50 // Let's check that the price is larger than 50cts
  )
}
