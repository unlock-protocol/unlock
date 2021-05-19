import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import KeyPricer from '../utils/keyPricer'
import AuthorizedLockOperations from '../operations/authorizedLockOperations'
import { SignedRequest } from '../types'

const logger = require('../logger')

namespace PriceController {
  // eslint-disable-next-line import/prefer-default-export
  // DEPRECATED (only used for debugging?)
  export const price = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { lockAddress } = req.params
    const keyPricer = new KeyPricer()
    try {
      const pricing = await keyPricer.generate(lockAddress, req.chain)
      return res.json(pricing)
    } catch (error) {
      logger.error('PriceController.price', error)
      return res.json({})
    }
  }

  // This method will return the key price in USD by default, but can eventually be used to return prices in a different curreny (via query string)
  export const fiatPrice = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { lockAddress } = req.params

    try {
      // First, let's see if the lock was authorized for credit card payments
      const isAuthorizedForCreditCard = await AuthorizedLockOperations.hasAuthorization(
        lockAddress,
        req.chain
      )

      // TODO: check that the purchaser has enough funds to pay for gas?

      if (!isAuthorizedForCreditCard) {
        // We not not return any price in any currency
        return res.json({})
      }

      // Otherwise get the pricing to continue
      const pricing = await new KeyPricer().generate(lockAddress, req.chain)

      return res.json({
        usd: pricing,
      })
    } catch (error) {
      logger.error('PriceController.fiatPrice', error)
      return res.json({})
    }
  }
}

export = PriceController
