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
import { getWeb3Service } from '../initializers'

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
  purchaseType: z
    .union([z.literal('extend'), z.literal('purchase')])
    .default('purchase')
    .optional(),
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
    res.json(await fulfillmentDispatcher.balances())
    return
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
      purchaseType,
    } = await PaymentCaptureBody.parseAsync(request.body)
    const dispatcher = new Dispatcher()

    const [hasEnoughToPayForGas, soldOut] = await Promise.all([
      dispatcher.hasFundsForTransaction(network),
      isSoldOut(lockAddress, network, recipients.length),
    ])

    if (!hasEnoughToPayForGas) {
      response.status(400).send({
        error: `Purchaser does not have enough to pay for gas on ${network}`,
      })
      return
    }

    if (soldOut) {
      // TODO: Cancel authorization
      response.status(400).send({
        error: 'Lock is sold out.',
      })
      return
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

      const transactionHandler = async (
        _: any,
        transactionHash: string | null
      ) => {
        if (!transactionHash) {
          throw new Error('No transaction hash')
        }
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

      const fulfillmentDispatcher = new Dispatcher()
      const paymentIntentRecipients = paymentIntent.metadata.recipient
        .split(',')
        .map((recipient) => ({
          recipient,
        }))
      const paymentIntentNetwork = Number(paymentIntent.metadata.network)

      // Note: we will not wait for the tx to be fully executed as it may trigger an HTTP timeout!
      // This should be fine though since grantKeys transaction should succeed anyway
      let items: Record<'id' | 'owner', string>[] | null = []

      if (purchaseType === 'purchase') {
        items = await fulfillmentDispatcher.grantKeys(
          paymentIntent.metadata.lock,
          paymentIntentRecipients,
          paymentIntentNetwork,
          transactionHandler
        )
      } else if (purchaseType === 'extend') {
        const web3Service = getWeb3Service()
        const owner = paymentIntentRecipients?.[0]?.recipient || userAddress
        const tokenId = await web3Service.tokenOfOwnerByIndex(
          paymentIntent.metadata.lock,
          owner,
          0,
          paymentIntentNetwork
        )
        await fulfillmentDispatcher.grantKeyExtension(
          paymentIntent.metadata.lock,
          tokenId,
          paymentIntentNetwork,
          transactionHandler
        )
        items = [
          {
            id: tokenId,
            owner,
          },
        ]
      }

      /**
       * For now, we are only allowing subscription for the user who purchased the key, not for the multiple recipients
       * because we don't have a way for them to "accept" the subscription and we don't want owner to be charged for all of them
       * without a way to manage these from the dashboard.
       */
      const key = items?.find(
        (item) => item.owner.toLowerCase() === userAddress.toLowerCase()
      )

      if (!key) {
        return
      }

      const split =
        purchaseType === 'extend' ? 1 : paymentIntentRecipients?.length || 1
      const amount = paymentIntent.amount / split
      const unlockServiceFee = paymentIntent.application_fee_amount
        ? paymentIntent.application_fee_amount / split
        : 0
      const recurring = Number(paymentIntent.metadata.recurring || 0)
      const keyId = Number(key.id)
      const [subscription] = await KeySubscription.upsert(
        {
          unlockServiceFee,
          amount,
          keyId,
          lockAddress,
          userAddress,
          network,
          recurring,
          connectedCustomer: paymentIntentRecord.connectedCustomerId,
          stripeCustomerId: paymentIntentRecord.stripeCustomerId,
        },
        {
          conflictFields: ['network', 'lockAddress', 'keyId', 'userAddress'],
        }
      )
      logger.info(`Subscription updated for id: ${subscription?.id}`)
    } catch (error) {
      if (response.headersSent) {
        return
      }
      logger.error('There was an error when capturing payment', error)
      response.status(400).send({ error: error.message })
      return
    }
  }

  async canClaim(request: Request, response: Response) {
    try {
      const network = Number(request.params.network)
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const { recipients, data } = CanClaimBody.parse(request.body)
      const pricer = new KeyPricer()

      const fulfillmentDispatcher = new Dispatcher()
      const [totalAmount, soldOut] = await Promise.all([
        getTotalPurchasePriceInCrypto({
          lockAddress,
          network,
          recipients,
          data: data || [],
        }),
        isSoldOut(lockAddress, network, recipients.length),
      ])

      if (soldOut) {
        response.status(400).send({
          message: 'Lock is sold out',
        })
        return
      }

      if (BigInt(totalAmount) > BigInt(0)) {
        response.status(400).send({
          message: 'Lock is not free',
        })
        return
      }

      if (LOCKS_WITH_DISABLED_CLAIMS.indexOf(lockAddress.toLowerCase()) > -1) {
        response.status(400).send({
          message: 'Claim disabled for this lock',
        })
        return
      }

      const [hasEnoughToPayForGas, canAffordGas] = await Promise.all([
        fulfillmentDispatcher.hasFundsForTransaction(network),
        pricer.canAffordGrant(network),
      ])

      if (!canAffordGas.canAfford) {
        response.status(400).send({
          message: canAffordGas.reason,
        })
        return
      }

      if (!hasEnoughToPayForGas) {
        response.status(400).send({
          message:
            'Purchaser does not have enough funds to allow claiming the membership',
        })
        return
      }

      response.status(200).send({
        canClaim: true,
      })
      return
    } catch (error) {
      logger.error(error)
      response.status(500).send({
        message: 'You cannot claim the membership',
      })
      return
    }
  }
}
