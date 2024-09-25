import { RequestHandler } from 'express'

import {
  getStripeConnectForLock,
  getStripeCustomerIdForAddress,
  createStripeCustomer,
} from '../../operations/stripeOperations'
import PaymentProcessor from '../../payment/paymentProcessor'
import * as Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import { z } from 'zod'
import { isSoldOut } from '../../operations/lockOperations'
import Dispatcher from '../../fulfillment/dispatcher'

const createPaymentIntentBody = z.object({
  recipients: z
    .array(z.string())
    .min(1)
    .transform((item) => item.map((item) => Normalizer.ethereumAddress(item))),
  stripeTokenId: z.string(),
  pricing: z.number(),
  recurring: z.number().optional(),
  referrers: z
    .array(z.union([z.string(), z.null()]))
    .nullish()
    .default([]),
  data: z
    .array(z.union([z.string(), z.null()]))
    .nullish()
    .default([]),
})

const Processor = new PaymentProcessor()

export const createSetupIntent: RequestHandler = async (request, response) => {
  try {
    const userAddress = Normalizer.ethereumAddress(request.user!.walletAddress)
    let stripeCustomerId = await getStripeCustomerIdForAddress(userAddress)
    if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomer(undefined, userAddress)
    }

    const setupIntent = await Processor.createSetupIntent({
      customerId: stripeCustomerId,
    })

    return response.status(201).send(setupIntent)
  } catch (error) {
    logger.error(error.message)
    return response.status(500).send({
      error: 'Unable to create setupIntent',
    })
  }
}

export const list: RequestHandler = async (request, response) => {
  try {
    const userAddress = Normalizer.ethereumAddress(request.user!.walletAddress)
    let customerId = await getStripeCustomerIdForAddress(userAddress)

    if (!customerId) {
      customerId = await createStripeCustomer(undefined, userAddress)
    }
    const methods = await Processor.listCardMethods({
      customerId,
    })

    return response.status(200).send({
      methods,
    })
  } catch (error) {
    logger.error(error.message)
    return response.status(500).send({
      message: 'Unable to find methods associated with the account',
    })
  }
}

export const createPaymentIntent: RequestHandler = async (
  request,
  response
) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const userAddress = Normalizer.ethereumAddress(request.user!.walletAddress)
  const { recipients, recurring, stripeTokenId, pricing, data, referrers } =
    await createPaymentIntentBody.parseAsync(request.body)

  const soldOut = await isSoldOut(lockAddress, network, recipients.length)
  if (soldOut) {
    return response.status(400).send({ message: 'Lock is sold out.' })
  }

  const { stripeEnabled, stripeAccount } = await getStripeConnectForLock(
    lockAddress,
    network
  )

  if (!stripeEnabled || !stripeAccount) {
    return response
      .status(400)
      .send({ message: 'Missing Stripe Connect integration' })
  }

  const stripeConnectApiKey = stripeAccount.id

  let stripeCustomerId = await getStripeCustomerIdForAddress(userAddress)

  if (!stripeCustomerId && stripeTokenId) {
    // Create a "global" stripe customer id
    // (we will create local customer when we issue charges for a connected lock)
    stripeCustomerId = await createStripeCustomer(
      stripeTokenId,
      Normalizer.ethereumAddress(userAddress)
    )
  }

  if (!stripeCustomerId) {
    return response
      .status(400)
      .send({ message: 'Missing Stripe customer info' })
  }

  const dispatcher = new Dispatcher()
  const hasEnoughToPayForGas = await dispatcher.hasFundsForTransaction(network)

  if (!hasEnoughToPayForGas) {
    return response.status(400).send({
      error: `Purchaser does not have enough to pay for gas on ${network}`,
    })
  }
  const processor = new PaymentProcessor()
  try {
    const paymentIntentDetails = await processor.createPaymentIntent(
      userAddress,
      recipients,
      stripeCustomerId,
      lockAddress,
      pricing,
      network,
      stripeConnectApiKey,
      recurring,
      data,
      referrers
    )
    return response.send(paymentIntentDetails)
  } catch (error) {
    logger.error(error.message)
    return response.status(500).send({
      error: `We could not capture the payment. ${error.message}`,
    })
  }
}

export const removePaymentMethods: RequestHandler = async (
  request,
  response
) => {
  const userAddress = Normalizer.ethereumAddress(request.user!.walletAddress)
  const customerId = await getStripeCustomerIdForAddress(userAddress)

  if (!customerId) {
    return response
      .status(400)
      .send({ message: 'Missing Stripe customer info' })
  }

  const processor = new PaymentProcessor()
  await processor.removePaymentMethods({
    customerId,
  })
  return response.status(200).send({ success: true })
}
