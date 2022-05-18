import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import {
  getStripeConnectForLock,
  getStripeCustomerIdForAddress,
  createStripeCustomer,
} from '../operations/stripeOperations'
import KeyPricer from '../utils/keyPricer'

import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved, import/named
import PaymentProcessor from '../payment/paymentProcessor'
import * as Normalizer from '../utils/normalizer'
import Dispatcher from '../fulfillment/dispatcher'

import logger from '../logger'
import { isSoldOut } from '../operations/lockOperations'

const config = require('../../config/config')

namespace PurchaseController {
  /**
   *
   * @param _req
   * @param res
   * @returns
   */
  export const info = async (
    _req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const fulfillmentDispatcher = new Dispatcher()

    return res.json(await fulfillmentDispatcher.balances())
  }

  // DEPRECATED
  export const purchase = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { publicKey, lock, stripeTokenId, pricing, network, recipient } =
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
        Normalizer.ethereumAddress(recipient),
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

  /**
   * Creates a payment intent that will be passed to the front-end for confirmation with the Stripe API.
   * Once confirmed, the payment will need to be captured
   * This flow supports 3D Secure.
   * @param req
   * @param res
   * @returns
   */
  export const createPaymentIntent = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const {
      publicKey,
      lock,
      stripeTokenId,
      pricing,
      network,
      recipients,
      userAddress,
    } = req.body.message['Charge Card']

    const normalizedRecipients: string[] = recipients.map((address: string) =>
      Normalizer.ethereumAddress(address)
    )
    const soldOut = await isSoldOut(lock, network, normalizedRecipients.length)
    if (soldOut) {
      return res.status(400).send({
        error: 'Lock is sold out.',
      })
    }

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
      // Create a "global" stripe customer id
      // (we will create local customer when we issue charges for a connected lock)
      stripeCustomerId = await createStripeCustomer(
        stripeTokenId,
        Normalizer.ethereumAddress(publicKey)
      )
    }

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
      const paymentIntentDetails = await processor.createPaymentIntent(
        Normalizer.ethereumAddress(userAddress),
        normalizedRecipients,
        stripeCustomerId,
        Normalizer.ethereumAddress(lock),
        pricing,
        network,
        stripeConnectApiKey
      )
      return res.send(paymentIntentDetails)
    } catch (error) {
      logger.error(error)
      return res.status(400).send({
        error: error.message,
      })
    }
  }

  /**
   * Captures a payment intent and exexutes the transaction to airdrop an NFT to the user.
   * @param req
   * @param res
   * @returns
   */
  export const capturePaymentIntent = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { lock, network, recipients, userAddress, paymentIntent } = req.body

    const normalizedRecipients: string[] = recipients.map((address: string) =>
      Normalizer.ethereumAddress(address)
    )
    const dispatcher = new Dispatcher()
    const hasEnoughToPayForGas = await dispatcher.hasFundsForTransaction(
      network
    )
    if (!hasEnoughToPayForGas) {
      return res.status(400).send({
        error: `Purchaser does not have enough to pay for gas on ${network}`,
      })
    }

    const soldOut = await isSoldOut(lock, network, normalizedRecipients.length)
    if (soldOut) {
      return res.status(400).send({
        error: 'Lock is sold out.',
      })
    }

    try {
      const processor = new PaymentProcessor(config.stripeSecret)
      const hash = await processor.captureConfirmedPaymentIntent(
        Normalizer.ethereumAddress(userAddress),
        normalizedRecipients,
        Normalizer.ethereumAddress(lock),
        network,
        paymentIntent
      )
      return res.send({
        transactionHash: hash,
      })
    } catch (error) {
      logger.error('There was an error when capturing payment', error)
      return res.status(400).send({ error: error.message })
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
    const fulfillmentDispatcher = new Dispatcher()

    if (pricing.keyPrice !== undefined && pricing.keyPrice > 0) {
      return res.status(500).send('Lock is not free')
    }

    const hasEnoughToPayForGas =
      await fulfillmentDispatcher.hasFundsForTransaction(network)
    if (!hasEnoughToPayForGas) {
      return res.status(500).send('Purchaser does not have enough funds!')
    }

    if (!(await pricer.canAffordGrant(network))) {
      return res.status(500).send('Gas fees too high!')
    }

    try {
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
