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
import Stripe from 'stripe'
import stripe from '../../config/stripe'
import { ethers } from 'ethers'
import { recoverTransferAuthorization } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'

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
    throw new Error('Lock is sold out.')
  }

  const stripeConnectApiKey = await getStripeConnectForLock(
    lockAddress,
    network
  )

  if (stripeConnectApiKey == 0 || stripeConnectApiKey == -1) {
    return response
      .status(400)
      .send({ message: 'Missing Stripe Connect integration' })
  }

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

const createOnRampSessionBody = z.object({
  signature: z.string(),
  message: z.object({
    from: z.string(),
    nonce: z.string(),
    to: z.string(),
    validAfter: z.number(),
    validBefore: z.number(),
    value: z.string(),
  }),
})

/**
 * Create session for universal credit card support.
 * TODO: use swap and purchase?
 * @param request
 * @param response
 * @returns
 */
export const createOnRampSession: RequestHandler = async (
  request,
  response
) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const userAddress = Normalizer.ethereumAddress(request.user!.walletAddress)
  const { signature, message } = await createOnRampSessionBody.parseAsync(
    request.body
  )

  let usdcContractAddress
  const networkConfig = networks[network]
  if (networkConfig?.tokens) {
    usdcContractAddress = networkConfig.tokens.find(
      (token: any) => token.symbol === 'USDC'
    )?.address
  }

  if (!usdcContractAddress) {
    throw new Error('USDC not available for this network')
  }

  const recovered = await recoverTransferAuthorization(
    usdcContractAddress,
    message,
    network,
    signature
  )

  if (recovered.toLowerCase() !== userAddress.toLowerCase()) {
    return response.status(400).send({ message: 'Signatures do not match' })
  }

  const OnrampSessionResource = Stripe.StripeResource.extend({
    create: Stripe.StripeResource.method({
      method: 'POST',
      path: 'crypto/onramp_sessions',
    }),
  })

  // Value is in 6 decimals (USDC)
  const amount = ethers.utils.formatUnits(
    ethers.BigNumber.from(message.value),
    6
  )

  const session = await new OnrampSessionResource(stripe).create({
    transaction_details: {
      lock_wallet_address: true, // Making sure the user does not change the wallet!
      source_currency: 'usd', // We only support USDC to USDC
      destination_currency: 'usdc', // We only support USD to USDC
      destination_exchange_amount: amount,
      destination_network: 'ethereum', // use polygon when applicable?
      supported_destination_currencies: ['usdc'],
      supported_destination_networks: ['ethereum'],
      wallet_addresses: {
        ethereum: userAddress,
      },
    },
  })

  // TODO: save everything to DB?
  console.log(lockAddress, network, recovered, userAddress, {
    signature,
    message,
    session,
  })

  return response.status(200).send({ session })
}

/**
 * Execute the purchase transaction!
 * @param request
 * @param response
 * @returns
 */
export const captureOnRamp: RequestHandler = async (request, response) => {
  const transactionHash = request.query.transactionHash

  return response.send({
    transactionHash,
  })
}
