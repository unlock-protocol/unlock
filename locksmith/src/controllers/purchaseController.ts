import { Response, Request } from 'express'
import stripe from '../config/stripe'
import KeyPricer from '../utils/keyPricer'
import { SignedRequest } from '../types'
import PaymentProcessor from '../payment/paymentProcessor'
import * as Normalizer from '../utils/normalizer'
import Dispatcher from '../fulfillment/dispatcher'

import logger from '../logger'
import { isSoldOut } from '../operations/lockOperations'
import { KeySubscription } from '../models'
import { LOCKS_WITH_DISABLED_CLAIMS } from './v2/claimController'
import { z } from 'zod'
import { getTotalPurchasePriceInCrypto } from '../utils/claim'

const PaymentCaptureBody = z.object({
  lock: z.string().transform((item) => Normalizer.ethereumAddress(item)),
  network: z.number(),
  userAddress: z.string().transform((item) => Normalizer.ethereumAddress(item)),
  recipients: z.array(
    z.string().transform((item) => Normalizer.ethereumAddress(item))
  ),
  referrers: z
    .array(z.union([z.string(), z.null()]))
    .nullish()
    .default([]),
  data: z
    .array(z.union([z.string(), z.null()]))
    .nullish()
    .default([]),
  paymentIntent: z.string(),
})

const CanClaimBody = z.object({
  recipients: z.array(
    z.string().transform((item) => Normalizer.ethereumAddress(item))
  ),
  data: z
    .array(z.union([z.string(), z.null()]))
    .nullish()
    .default([]),
})

export class PurchaseController {
  // Provides info on the purchaser addresses. This is used for ticket verification as well to verify who signed the QR code.
  async info(_req: SignedRequest, res: Response) {
    const fulfillmentDispatcher = new Dispatcher()
    return res.json(await fulfillmentDispatcher.balances())
  }

  /*
   * Captures a payment intent and exexutes the transaction to airdrop an NFT to the user.
   */
  async capturePaymentIntent(
    request: SignedRequest,
    response: Response
  ): Promise<any> {
    const {
      network,
      recipients,
      paymentIntent: paymentIntentId,
      data,
      referrers,
      lock: lockAddress,
      userAddress,
    } = await PaymentCaptureBody.parseAsync(request.body)
    const dispatcher = new Dispatcher()
    const hasEnoughToPayForGas = await dispatcher.hasFundsForTransaction(
      network
    )
    if (!hasEnoughToPayForGas) {
      return response.status(400).send({
        error: `Purchaser does not have enough to pay for gas on ${network}`,
      })
    }

    const soldOut = await isSoldOut(lockAddress, network, recipients.length)

    if (soldOut) {
      // TODO: Cancel authorization
      return response.status(400).send({
        error: 'Lock is sold out.',
      })
    }

    try {
      const processor = new PaymentProcessor()
      const { charge, paymentIntent, paymentIntentRecord } =
        await processor.getPaymentIntentRecordAndCharge({
          userAddress,
          lockAddress,
          network,
          paymentIntentId,
          recipients,
          referrers: referrers || [],
          data: data || [],
        })

      const fulfillmentDispatcher = new Dispatcher()

      // Note: we will not wait for the tx to be fully executed as it may trigger an HTTP timeout!
      // This should be fine though since grantKeys transaction should succeed anyway
      const items: Record<'id' | 'owner', string>[] | null =
        await fulfillmentDispatcher.grantKeys(
          paymentIntent.metadata.lock,
          paymentIntent.metadata.recipient.split(',').map((recipient) => ({
            recipient,
          })),
          parseInt(paymentIntent.metadata.network, 10),
          async (_: any, transactionHash: string) => {
            // Update our charge object
            charge.transactionHash = transactionHash
            await charge.save()

            // Update Stripe's payment Intent
            await stripe.paymentIntents.update(
              paymentIntentId,
              {
                metadata: {
                  transactionHash,
                },
              },
              {
                stripeAccount: paymentIntentRecord.connectedStripeId,
              }
            )

            // We only charge the card when everything else was successful
            await stripe.paymentIntents.capture(paymentIntentId, {
              stripeAccount: paymentIntentRecord.connectedStripeId,
            })
            // Send the transaction hash without waiting.
            response.status(201).send({
              transactionHash,
            })
          }
        )

      /**
       * For now, we are only allowing subscription for the user who purchased the key, not for the multiple recipients
       * because we don't have a way for them to "accept" the subscription and we don't want owner to be charged for all of them
       * without a way to manage these from the dashboard.
       */
      const key = items?.find((item) => item.owner === userAddress)

      if (!key) {
        return
      }

      const split = recipients?.length || 1
      const subscription = new KeySubscription()
      subscription.connectedCustomer = paymentIntentRecord.connectedCustomerId
      subscription.stripeCustomerId = paymentIntentRecord.stripeCustomerId
      subscription.keyId = Number(key.id)
      subscription.amount = paymentIntent.amount / split
      subscription.unlockServiceFee = paymentIntent.application_fee_amount
        ? paymentIntent.application_fee_amount / split
        : 0
      subscription.lockAddress = lockAddress
      subscription.userAddress = userAddress
      subscription.network = network
      subscription.recurring = Number(paymentIntent.metadata.recurring || 0)
      await subscription.save()

      logger.info(
        `Subscription ${subscription.id} created for ${subscription.userAddress} on ${subscription.network} and for lock ${subscription.lockAddress}. It will renew key ${subscription.keyId} for ${subscription.recurring}`
      )

      return
    } catch (error) {
      if (response.headersSent) {
        return
      }
      logger.error('There was an error when capturing payment', error)
      return response.status(400).send({ error: error.message })
    }
  }

  async canClaim(request: Request, response: Response) {
    try {
      const network = Number(request.params.network)
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const { recipients, data } = CanClaimBody.parse(request.body)
      const pricer = new KeyPricer()

      const fulfillmentDispatcher = new Dispatcher()
      const totalAmount = await getTotalPurchasePriceInCrypto({
        lockAddress,
        network,
        recipients,
        data: data || [],
      })

      if (totalAmount.gt(0)) {
        return response.status(400).send({
          message: 'Lock is not free',
        })
      }

      if (LOCKS_WITH_DISABLED_CLAIMS.indexOf(lockAddress.toLowerCase()) > -1) {
        return response.status(400).send({
          message: 'Claim disabled for this lock',
        })
      }

      const [hasEnoughToPayForGas, canAffordGas] = await Promise.all([
        fulfillmentDispatcher.hasFundsForTransaction(network),
        pricer.canAffordGrant(network),
      ])

      if (!hasEnoughToPayForGas) {
        return response.status(500).send({
          message:
            'Purchaser does not have enough funds to allow claiming the membership',
        })
      }

      if (!canAffordGas) {
        return response.status(500).send({
          message: 'Gas fees is too pricey.',
        })
      }

      return response.status(200).send({
        canClaim: true,
      })
    } catch (error) {
      logger.error(error)
      return response.status(500).send({
        message: 'You cannot claim the membership',
      })
    }
  }
}
