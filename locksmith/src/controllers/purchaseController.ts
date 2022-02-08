import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import {
  getStripeConnectForLock,
  getStripeCustomerIdForAddress,
  createStripeCustomer,
} from '../operations/stripeOperations'
import KeyPricer, { MAX_GRANT_COST } from '../utils/keyPricer'

import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved, import/named
import PaymentProcessor from '../payment/paymentProcessor'
import * as Normalizer from '../utils/normalizer'
import Dispatcher from '../fulfillment/dispatcher'

import logger from '../logger'

const config = require('../../config/config')

namespace PurchaseController {
  export const purchase = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { publicKey, lock, stripeTokenId, pricing, network } =
      req.body.message['Charge Card']

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

    const dispatcher = new Dispatcher()
    const hasEnoughToPayForGas = await dispatcher.hasFundsForTransaction(
      network
    )
    if (!hasEnoughToPayForGas) {
      return res.status(400).send({
        error: `Purchaser does not have enough to pay for gas on ${network}`,
      })
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
      logger.error(error)
      return res.status(400).send(error)
    }
  }

  // TODO: add captcha to avoid spamming!
  // TODO: save claims?
  export const claim = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { publicKey, lock, network } = req.body.message['Claim Membership']

    // First check that the lock is indeed free and that the gas costs is low enough!
    const pricer = new KeyPricer()
    const pricing = await pricer.generate(lock, network)

    if (pricing.keyPrice !== undefined && pricing.keyPrice > 0) {
      return res.status(500).send('Lock is not free')
    }

    const costToGrant = await pricer.gasFee(network, 1000)
    if (costToGrant >= MAX_GRANT_COST) {
      return res.status(500).send('Gas fees too high!')
    }

    try {
      const fulfillmentDispatcher = new Dispatcher()
      await fulfillmentDispatcher.purchaseKey(
        Normalizer.ethereumAddress(lock),
        Normalizer.ethereumAddress(publicKey),
        network,
        async (_: any, transactionHash: string) => {
          return res.send({
            transactionHash,
          })
        }
      )
    } catch (error) {
      logger.error(error)
      return res.status(400).send(error)
    }
  }
}

export = PurchaseController
