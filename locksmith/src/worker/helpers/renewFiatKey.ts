import { getStripeConnectForLock } from '../../operations/stripeOperations'
import { getSettings } from '../../operations/lockSettingOperations'
import Dispatcher from '../../fulfillment/dispatcher'
import { logger } from '../../logger'
import { Charge, KeyRenewal, KeySubscription } from '../../models'
import stripe from '../../config/stripe'
import { Op } from 'sequelize'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

interface RenewKeyReturned {
  keyId?: string
  lockAddress: string
  network: number
  tx?: string
  error?: string
}

interface Options {
  lockAddress: string
  userAddress: string
  keyId: string
  network: number
}

export async function renewFiatKey({
  lockAddress,
  userAddress,
  keyId,
  network,
}: Options): Promise<RenewKeyReturned> {
  try {
    const renewalInfo = {
      keyId,
      network,
      lockAddress,
    }

    const { stripeEnabled, stripeAccount = '' } = await getStripeConnectForLock(
      lockAddress,
      network
    )

    if (!stripeEnabled) {
      throw new Error('Stripe connect is not enabled')
    }

    if (!stripeAccount) {
      throw new Error('No stripe connect account associated with the lock')
    }

    const subscription = await KeySubscription.findOne({
      where: {
        keyId,
        lockAddress,
        userAddress,
        recurring: {
          [Op.gt]: 0,
        },
      },
    })

    if (!subscription) {
      throw new Error('No subscription found')
    }

    if (subscription.userAddress !== userAddress) {
      throw new Error('Key owner is not the subscriber')
    }

    const customer = await stripe.customers.retrieve(
      subscription.connectedCustomer,
      {
        stripeAccount,
      }
    )

    if (customer.deleted) {
      throw new Error('Customer does not exist anymore')
    }

    const paymentMethod = await stripe.paymentMethods.list(
      {
        customer: customer.id,
        type: 'card',
      },
      {
        stripeAccount,
      }
    )

    const paymentMethodId = paymentMethod.data?.[0]?.id

    if (!paymentMethodId) {
      throw new Error('No payment method available on the customer profile.')
    }

    const web3Service = new Web3Service(networks)

    // Get provider for network
    const provider = await web3Service.providerForNetwork(subscription.network)

    const fulfillmentDispatcher = new Dispatcher()

    // retrieve lock currency
    const { creditCardCurrency = 'usd' } = await getSettings({
      lockAddress,
      network,
    })

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: subscription.amount,
        currency: creditCardCurrency,
        capture_method: 'manual',
        // Confirm the payment off-session automatically.
        confirm: true,
        off_session: true,
        application_fee_amount: subscription.unlockServiceFee,
        customer: customer.id,
        payment_method: paymentMethodId,
        metadata: {
          lock: lockAddress,
          keyId,
          network,
          recipients: [userAddress].join(','),
          purchaser: userAddress,
          renewal: subscription.recurring,
        },
      },
      {
        stripeAccount,
      }
    )

    if (paymentIntent.status !== 'requires_capture') {
      throw new Error('Cannot charge for the payment intent properly.')
    }

    const response = await new Promise((resolve, reject) => {
      fulfillmentDispatcher.grantKeyExtension(
        subscription.lockAddress,
        subscription.keyId,
        subscription.network,
        async (_, hash) => {
          if (!hash) {
            throw new Error("Transaction didn't go through.")
          }
          const receipt = await provider.waitForTransaction(hash)
          // Transaction failed for some reason
          if (!receipt?.status) {
            throw new Error('Transaction failed.')
          }

          // Every time, we grant an extension - decrease the recurring left counter.
          subscription.recurring -= 1
          await subscription.save()

          // Capture it on the connected stripe account
          const intent = await stripe.paymentIntents.capture(paymentIntent.id, {
            stripeAccount,
          })

          switch (intent.status) {
            case 'succeeded': {
              // record renewal in db
              const recordedrenewalInfo = {
                ...renewalInfo,
                keyId: renewalInfo.keyId.toString(),
                tx: hash,
              }
              await stripe.paymentIntents.update(
                intent.id,
                {
                  metadata: {
                    transactionHash: hash,
                  },
                },
                {
                  stripeAccount,
                }
              )
              await KeyRenewal.create(recordedrenewalInfo)
              // Create the charge object on our end!
              await Charge.create({
                userAddress: paymentIntent.metadata.purchaser,
                recipients: paymentIntent.metadata.recipients.split(','),
                lock: paymentIntent.metadata.lock,
                stripeCustomerId: paymentIntent.customer?.toString(), // TODO: consider checking the customer id under Unlock's stripe account?
                connectedCustomer: paymentIntent.customer?.toString(),
                totalPriceInCents: paymentIntent.amount,
                unlockServiceFee: paymentIntent.application_fee_amount,
                stripeCharge: paymentIntent.id,
                recurring: 0,
                chain: network,
              })
              resolve(recordedrenewalInfo)
              break
            }

            case 'requires_action': {
              reject('Customer need to go through payment method approval.')
              break
            }

            case 'canceled': {
              reject('Payment was cancelled on the stripe side')
              break
            }
            default:
              reject('Payment did not suceed')
          }
        }
      )
    })
    return response as RenewKeyReturned
  } catch (error) {
    logger.error(error.message)
    return {
      network,
      keyId,
      lockAddress,
      error: error.message,
    }
  }
}
