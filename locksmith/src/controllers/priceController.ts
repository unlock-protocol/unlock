import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import KeyPricer from '../utils/keyPricer'
import AuthorizedLockOperations from '../operations/authorizedLockOperations'

const config = require('../../config/config')

namespace PriceController {
  // eslint-disable-next-line import/prefer-default-export
  // DEPRECATED
  export const price = async (req: Request, res: Response): Promise<any> => {
    const { lockAddress } = req.params
    const keyPricer = new KeyPricer(
      config.web3ProviderHost,
      config.unlockContractAddress
    )

    const pricing = await keyPricer.generate(lockAddress)
    return res.json(pricing)
  }

  // This method will return the key price in USD by default, but can eventually be used to return prices in a different curreny (via query string)
  export const fiatPrice = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { lockAddress } = req.params
    const keyPricer = new KeyPricer(
      config.web3ProviderHost,
      config.unlockContractAddress
    )

    // First, let's see if the lock was authorized for credit card payments
    const isAuthorizedForCreditCard = await AuthorizedLockOperations.hasAuthorization(
      lockAddress
    )

    if (!isAuthorizedForCreditCard) {
      // We not not return any price in any currency
      return res.json({})
    }

    // Otherwise get the pricing.
    const pricing = await keyPricer.generate(lockAddress)
    const totalPriceInCents = Object.values(pricing).reduce((a, b) => a + b)

    // TODO: convert from the currency.
    // For now we assume only stable coin priced locks have been approved so conversion is 1 => 1

    return res.json({
      usd: totalPriceInCents,
    })
  }
}

export = PriceController
