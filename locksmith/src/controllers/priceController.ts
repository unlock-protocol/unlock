import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import KeyPricer from '../utils/keyPricer'
import AuthorizedLockOperations from '../operations/authorizedLockOperations'
import { SignedRequest } from '../types'
import { getStripeConnectForLock } from '../operations/stripeOperations'
import * as Normalizer from '../utils/normalizer'

const logger = require('../logger')

namespace PriceController {
  // This method will return the key price in USD by default, but can eventually be used to return prices in a different curreny (via query string)
  export const fiatPrice = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
    try {
      // check that we have a Stripe key for this lock!
      const stripeConnected = await getStripeConnectForLock(
        lockAddress,
        req.chain
      )

      // let's see if the lock was authorized for credit card payments
      const isAuthorizedForCreditCard = await AuthorizedLockOperations.hasAuthorization(
        lockAddress,
        req.chain
      )

      // TODO: check that the purchaser has enough funds to pay for gas?

      const pricer = new KeyPricer()
      const pricing = await pricer.generate(lockAddress, req.chain)

      // Let's check tthat the price is larger than 50cts
      const totalPriceInCents = Object.values(pricing).reduce((a, b) => a + b)

      if (
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
