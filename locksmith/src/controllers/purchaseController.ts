import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { SignedRequest, ethereumAddress } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved, import/named
import AuthorizedLockOperations from '../operations/authorizedLockOperations'
import PaymentProcessor from '../payment/paymentProcessor'

const config = require('../../config/config')

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
    } else if (!(await authorizedLock(lock))) {
      return res.sendStatus(451)
    } else {
      let paymentProcessor = new PaymentProcessor(
        config.stripeSecret,
        config.web3ProviderHost,
        config.unlockContractAddress
      )

      const hash = await paymentProcessor.initiatePurchase(
        purchaser,
        lock,
        config.purchaserCredentails,
        config.web3ProviderHost,
        purchaser
      )

      return res.send({
        transactionHash: hash,
      })
    }
  }

  const expired = (expiry: number): Boolean => {
    let currentTime = Math.floor(Date.now() / 1000)
    return expiry < currentTime
  }

  const authorizedLock = (lock: ethereumAddress): Promise<Boolean> => {
    return AuthorizedLockOperations.hasAuthorization(lock)
  }
}

export = PurchaseController
