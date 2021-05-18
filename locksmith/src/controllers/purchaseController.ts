import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { SignedRequest, ethereumAddress } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved, import/named
import AuthorizedLockOperations from '../operations/authorizedLockOperations'
import PaymentProcessor from '../payment/paymentProcessor'
import * as PriceRange from '../utils/priceRange'
import KeyPricer from '../utils/keyPricer'

const config = require('../../config/config')

namespace PurchaseController {
  export const purchase = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { expiry } = req.body.message.purchaseRequest
    const { lock } = req.body.message.purchaseRequest
    const purchaser = req.body.message.purchaseRequest.recipient
    if (expired(expiry)) {
      return res.sendStatus(412)
    }
    if (!(await authorizedLock(lock))) {
      return res.sendStatus(451)
    }
    const hash = await processor().initiatePurchase(
      purchaser,
      lock,
      config.purchaserCredentails,
      config.web3ProviderHost,
      purchaser,
      req.chain
    )

    return res.send({
      transactionHash: hash,
    })
  }

  export const purchaseUSD = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { expiry } = req.body.message.purchaseRequest
    const { lock } = req.body.message.purchaseRequest
    const requestedPurchaseAmount = req.body.message.purchaseRequest.USDAmount
    const purchaser = req.body.message.purchaseRequest.recipient

    if (expired(expiry)) {
      return res.sendStatus(412)
    }

    const currentPrice = await keyPricer().keyPriceUSD(lock, req.chain)
    const validRequestPrice = PriceRange.within({
      requestPrice: requestedPurchaseAmount,
      currentPrice,
    })

    if (validRequestPrice) {
      const hash = await processor().initiatePurchaseForConnectedStripeAccount(
        purchaser,
        lock,
        config.purchaserCredentails,
        config.web3ProviderHost,
        purchaser,
        'connectedStripeAccount', // TODO: replace with value coming from lock metadata, saved by one of the lock managers
        req.chain
      )

      return res.send({
        transactionHash: hash,
      })
    } else {
      return res.sendStatus(417)
    }
  }

  const keyPricer = (): KeyPricer => {
    return new KeyPricer()
  }

  const processor = (): PaymentProcessor => {
    return new PaymentProcessor(config.stripeSecret)
  }

  const expired = (expiry: number): Boolean => {
    const currentTime = Math.floor(Date.now() / 1000)
    return expiry < currentTime
  }

  const authorizedLock = (lock: ethereumAddress): Promise<Boolean> => {
    return AuthorizedLockOperations.hasAuthorization(lock)
  }
}

export = PurchaseController
