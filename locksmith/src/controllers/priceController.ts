import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import KeyPricer from '../utils/keyPricer'
import AuthorizedLockOperations from '../operations/authorizedLockOperations'
import { SignedRequest } from '../types'
import { getStripeConnectForLock } from '../operations/stripeOperations'
import * as Normalizer from '../utils/normalizer'

import logger from '../logger'
import Dispatcher from '../fulfillment/dispatcher'

namespace PriceController {
  // This method will return the key price in USD by default, but can eventually be used to return prices in a different curreny (via query string)
  export const fiatPrice = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
    const quantity = Number(req.query.quantity || 1)
    try {
      const fulfillmentDispatcher = new Dispatcher()

      const hasEnoughToPayForGas =
        await fulfillmentDispatcher.hasFundsForTransaction(req.chain)

      // check that we have a Stripe key for this lock!
      const stripeConnected = await getStripeConnectForLock(
        lockAddress,
        req.chain
      )

      const pricer = new KeyPricer()
      const pricing = await pricer.generate(lockAddress, req.chain, quantity)
      if (
        hasEnoughToPayForGas &&
        pricing.keyPrice !== undefined &&
        pricing.keyPrice === 0 &&
        (await pricer.canAffordGrant(req.chain))
      ) {
        return res.json({
          usd: pricing,
          creditCardEnabled: true,
        })
      }

      // let's see if the lock was authorized for credit card payments
      const isAuthorizedForCreditCard =
        await AuthorizedLockOperations.hasAuthorization(lockAddress, req.chain)

      // Let's check tthat the price is larger than 50cts
      const totalPriceInCents = Object.values(pricing).reduce((a, b) => a + b)
      if (
        !hasEnoughToPayForGas ||
        !isAuthorizedForCreditCard ||
        stripeConnected == 0 ||
        stripeConnected == -1 ||
        totalPriceInCents < 50
      ) {
        return res.json({
          usd: pricing,
          creditCardEnabled: false,
        })
      }

      return res.json({
        usd: pricing,
        creditCardEnabled: true,
      })
    } catch (error) {
      logger.error('PriceController.fiatPrice', error)
      return res.json({})
    }
  }
}

export = PriceController
