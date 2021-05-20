import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved, import/named
import PaymentProcessor from '../payment/paymentProcessor'

const config = require('../../config/config')

namespace PurchaseController {
  export const purchaseUSD = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { lock } = req.body.message.purchaseRequest
    const { stripeCustomerId, recipient } = req.body.message.purchaseRequest

    const hash = await new PaymentProcessor(
      config.stripeSecret
    ).initiatePurchaseForConnectedStripeAccount(
      recipient,
      stripeCustomerId,
      lock,
      'connectedStripeAccount', // TODO: replace with value coming from lock metadata, saved by one of the lock managers
      req.chain
    )

    return res.send({
      transactionHash: hash,
    })
  }
}

export = PurchaseController
