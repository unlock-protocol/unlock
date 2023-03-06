import { Response } from 'express'
import KeyPricer from '../utils/keyPricer'
import AuthorizedLockOperations from '../operations/authorizedLockOperations'
import { SignedRequest } from '../types'
import { getStripeConnectForLock } from '../operations/stripeOperations'
import * as Normalizer from '../utils/normalizer'

import logger from '../logger'
import Dispatcher from '../fulfillment/dispatcher'

// This method will return the key price in USD by default, but can eventually be used to return prices in a different curreny (via query string)
export const fiatPrice = async (
  req: SignedRequest,
  res: Response
): Promise<any> => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const quantity = Number(req.query.quantity || 1)
  try {
    const fulfillmentDispatcher = new Dispatcher()
    const pricer = new KeyPricer()

    const [
      hasEnoughToPayForGas,
      stripeConnected,
      pricing,
      isAuthorizedForCreditCard,
    ] = await Promise.all([
      fulfillmentDispatcher.hasFundsForTransaction(req.chain),
      getStripeConnectForLock(lockAddress, req.chain),
      pricer.generate(lockAddress, req.chain, quantity),
      AuthorizedLockOperations.hasAuthorization(lockAddress, req.chain),
    ])

    // Let's check that the price is larger than 50cts
    const totalPriceInCents = Object.values(pricing).reduce((a, b) => a + b)
    if (
      !hasEnoughToPayForGas ||
      !isAuthorizedForCreditCard ||
      stripeConnected == 0 ||
      stripeConnected == -1 ||
      totalPriceInCents < 50
    ) {
      return res.send({
        usd: pricing,
        creditCardEnabled: false,
      })
    }

    return res.send({
      usd: pricing,
      creditCardEnabled: true,
    })
  } catch (error) {
    logger.error('PriceController.fiatPrice', error)
    // TODO: return a 500 error - work around for now to avoid breaking compatibility - response won't be cached
    return res.status(201).send({})
  }
}

const PriceController = {
  fiatPrice,
}

export default PriceController
