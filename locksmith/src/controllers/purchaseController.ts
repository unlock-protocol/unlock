import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import {
  getStripeConnectForLock,
  getStripeCustomerIdForAddress,
  createStripeCustomer,
} from '../operations/stripeOperations'
import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved, import/named
import PaymentProcessor from '../payment/paymentProcessor'
import * as Normalizer from '../utils/normalizer'

const config = require('../../config/config')

namespace PurchaseController {
  export const purchase = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const {
      publicKey,
      lock,
      stripeTokenId,
      pricing,
      network,
    } = req.body.message['Charge Card']

    // First, get the locks stripe account
    const stripeConnectApiKey = await getStripeConnectForLock(
      Normalizer.ethereumAddress(lock),
      network
    )

    if (stripeConnectApiKey == 0 || stripeConnectApiKey == -1) {
      return res
        .status(400)
        .send({ error: 'Missing Stripe Connect integration' })
    }

    let stripeCustomerId = await getStripeCustomerIdForAddress(
      Normalizer.ethereumAddress(publicKey)
    )

    if (!stripeCustomerId && stripeTokenId) {
      stripeCustomerId = await createStripeCustomer(
        stripeTokenId,
        Normalizer.ethereumAddress(publicKey)
      )
    }

    // Throw if no stripeCustomerId
    if (!stripeCustomerId) {
      return res.status(400).send({ error: 'Missing Stripe customer info' })
    }

    try {
      const processor = new PaymentProcessor(config.stripeSecret)
      const hash = await processor.initiatePurchaseForConnectedStripeAccount(
        Normalizer.ethereumAddress(publicKey),
        stripeCustomerId,
        Normalizer.ethereumAddress(lock),
        pricing,
        network,
        stripeConnectApiKey
      )
      return res.send({
        transactionHash: hash,
      })
    } catch (error) {
      console.error(error)
      return res.status(400).send(error)
    }
  }
}

export = PurchaseController
