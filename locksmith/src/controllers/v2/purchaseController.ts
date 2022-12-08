import { Response, Request } from 'express'
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
import config from '../../../config/config'

const createPaymentIntentBody = z.object({
  recipients: z
    .array(z.string())
    .min(1)
    .transform((item) => item.map((item) => Normalizer.ethereumAddress(item))),
  stripeTokenId: z.string(),
  pricing: z.number(),
  recurring: z.number().optional(),
})

export class PurchaseController {
  processor = new PaymentProcessor(config.stripeSecret!)
  async createSetupIntent(request: Request, response: Response) {
    try {
      const userAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress
      )
      let stripeCustomerId = await getStripeCustomerIdForAddress(userAddress)
      if (!stripeCustomerId) {
        stripeCustomerId = await createStripeCustomer(undefined, userAddress)
      }

      const setupIntent = await this.processor.createSetupIntent({
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

  async list(request: Request, response: Response) {
    try {
      const userAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress
      )
      let customerId = await getStripeCustomerIdForAddress(userAddress)

      if (!customerId) {
        customerId = await createStripeCustomer(undefined, userAddress)
      }
      const methods = await this.processor.listCardMethods({
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

  async createPaymentIntent(request: Request, response: Response) {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const userAddress = Normalizer.ethereumAddress(request.user!.walletAddress)
    const { recipients, recurring, stripeTokenId, pricing } =
      await createPaymentIntentBody.parseAsync(request.body)

    const soldOut = await isSoldOut(lockAddress, network, recipients.length)
    if (soldOut) {
      throw new Error('Lock is sold out.')
    }

    const stripeConnectApiKey = await getStripeConnectForLock(
      userAddress,
      network
    )

    if (stripeConnectApiKey == 0 || stripeConnectApiKey == -1) {
      return response
        .status(400)
        .send({ error: 'Missing Stripe Connect integration' })
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
        .send({ error: 'Missing Stripe customer info' })
    }

    const dispatcher = new Dispatcher()
    const hasEnoughToPayForGas = await dispatcher.hasFundsForTransaction(
      network
    )

    if (!hasEnoughToPayForGas) {
      throw new Error(
        `Purchaser does not have enough to pay for gas on ${network}`
      )
    }
    const processor = new PaymentProcessor(config.stripeSecret!)
    const paymentIntentDetails = await processor.createPaymentIntent(
      userAddress,
      recipients,
      stripeCustomerId,
      lockAddress,
      pricing,
      network,
      stripeConnectApiKey,
      recurring
    )
    return response.send(paymentIntentDetails)
  }
}
