import { getStripeConnectForLock } from '../../operations/stripeOperations'
import Dispatcher from '../../fulfillment/dispatcher'
import { logger } from '../../logger'
import { KeyRenewal, KeySubscription } from '../../models'
import Stripe from 'stripe'
import config from '../../../config/config'
import { Op } from 'sequelize'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

interface RenewKeyReturned {
  keyId?: number
  lockAddress: string
  network: number
  tx?: string
  error?: string
}

interface Options {
  lockAddress: string
  userAddress: string
  keyId: number
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

    const stripe = new Stripe(config.stripeSecret!, {
      apiVersion: '2020-08-27',
    })

    const stripeAccount = await getStripeConnectForLock(lockAddress, network)

    if (stripeAccount === 0 || stripeAccount === -1) {
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

    const customer = await stripe.customers.retrieve(
      subscription.connectedCustomer,
      {
        stripeAccount,
      }
    )

    if (!customer) {
      throw new Error('Customer does not exist anymore')
    }

    if (subscription.userAddress !== userAddress) {
      throw new Error('Key owner is not the subscriber')
    }

    const web3Service = new Web3Service(networks)
    // Get provider for network
    const provider = await web3Service.providerForNetwork(subscription.network)

    const fulfillmentDispatcher = new Dispatcher()

    const response = await new Promise((resolve, reject) => {
      fulfillmentDispatcher.grantKeyExtension(
        subscription.lockAddress,
        subscription.keyId,
        subscription.network,
        async (_, hash) => {
          if (!hash) {
            return
          }
          const receipt = await provider.waitForTransaction(hash)
          // Transaction failed for some reason
          if (!receipt?.status) {
            return
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

          const paymentMethodId = paymentMethod.data[0].id

          const paymentIntent = await stripe.paymentIntents.create(
            {
              amount: subscription.amount,
              currency: 'USD',
              confirm: true,
              application_fee_amount: subscription.unlockServiceFee,
              off_session: true,
              customer: customer.id,
              payment_method: paymentMethodId,
            },
            {
              stripeAccount,
            }
          )

          switch (paymentIntent.status) {
            case 'succeeded': {
              // record renewal in db
              const recordedrenewalInfo = {
                ...renewalInfo,
                tx: hash,
              }
              await KeyRenewal.create(recordedrenewalInfo)
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
