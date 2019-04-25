import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved
import AuthorizedLockOperations from '../operations/authorizedLockOperations'
import PaymentProcessor from '../payment/paymentProcessor'
import KeyPricer from '../utils/keyPricer'

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

namespace PurchaseController {
  //eslint-disable-next-line import/prefer-default-export
  export const purchase = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    let currentTime = Math.floor(Date.now() / 1000)
    const expiry = req.body.message.purchaseRequest.expiry
    const lockAddress = req.body.message.purchaseRequest.lock

    if (expiry < currentTime) {
      return res.sendStatus(412)
    }

    if (!(await AuthorizedLockOperations.hasAuthorization(lockAddress))) {
      return res.sendStatus(451)
    }

    let keyPricer = new KeyPricer()
    let itemizedPrice = keyPricer.generate(lockAddress)
    let totalPrice = Object.values(itemizedPrice).reduce((a, b) => a + b)

    let paymentProcessor = new PaymentProcessor(config.stripeSecret)
    paymentProcessor.chargeUser(req.owner, {
      price: totalPrice,
    })

    return res.sendStatus(202)
  }
}

export = PurchaseController
