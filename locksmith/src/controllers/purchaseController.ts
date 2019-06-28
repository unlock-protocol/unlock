import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved, import/named
import PaymentProcessor from '../payment/paymentProcessor'

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

// TODO: re-enable lock authorization pending business decision. See usage prior
// to #4930.
namespace PurchaseController {
  //eslint-disable-next-line import/prefer-default-export
  export const purchase = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const expiry = req.body.message.purchaseRequest.expiry
    const lock = req.body.message.purchaseRequest.lock
    const purchaser = req.body.message.purchaseRequest.recipient

    if (expired(expiry)) {
      return res.sendStatus(412)
    } else {
      let paymentProcessor = new PaymentProcessor(
        config.stripeSecret,
        config.web3ProviderHost,
        config.unlockContractAddress
      )

      await paymentProcessor.initiatePurchase(
        purchaser,
        lock,
        config.purchaserCredentails,
        config.web3ProviderHost,
        config.purchaserAddress
      )

      return res.sendStatus(202)
    }
  }

  const expired = (expiry: number): Boolean => {
    let currentTime = Math.floor(Date.now() / 1000)
    return expiry < currentTime
  }
}

export = PurchaseController
