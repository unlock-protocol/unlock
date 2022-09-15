import { getStripeConnectForLock } from '../../operations/stripeOperations'
import Dispatcher from '../../fulfillment/dispatcher'
import { logger } from '../../logger'
import { Charge, KeyRenewal } from '../../models'
import { FiatRecurringPurchase } from '../../models/FiatRecurringPurchase'
import Stripe from 'stripe'
import config from '../../../config/config'

interface RenewKeyReturned {
  keyId: number
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
      network,
      keyId,
      lockAddress,
    }

    const stripe = new Stripe(config.stripeSecret!, {
      apiVersion: '2020-08-27',
    })

    const stripeAccount = await getStripeConnectForLock(lockAddress, network)

    if (stripeAccount === 0 || stripeAccount === -1) {
      throw new Error('No stripe connect account associated with the lock')
    }

    const purchase = await FiatRecurringPurchase.findOne({
      where: {
        lockAddress,
        keyId,
        network,
        userAddress,
      },
    })

    if (!purchase) {
      throw new Error('Fiat purchase not found!')
    }

    const customer = await stripe.customers.retrieve(purchase.customerId, {
      stripeAccount,
    })

    if (!customer) {
      throw new Error('Customer does not exist anymore')
    }

    const fulfillmentDispatcher = new Dispatcher()

    const tx = await fulfillmentDispatcher.grantKeyExtension(
      purchase.lockAddress,
      purchase.keyId.toString(),
      purchase.network
    )

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
        amount: purchase.amount,
        currency: 'USD',
        confirm: true,
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
        const charge: Charge = await Charge.create({
          userAddress: paymentIntent.metadata.purchaser,
          recipients: paymentIntent.metadata.recipient.split(','),
          lock: paymentIntent.metadata.lock,
          stripeCustomerId: paymentIntent.customer, // TODO: consider checking the customer id under Unlock's stripe account?
          connectedCustomer: paymentIntent.customer,
          totalPriceInCents: paymentIntent.amount,
          unlockServiceFee: paymentIntent.application_fee_amount,
          stripeCharge: paymentIntent.id,
          chain: network,
        })

        await charge.save()
        // record renewal in db
        const recordedrenewalInfo = {
          ...renewalInfo,
          tx: tx,
        }
        await KeyRenewal.create(recordedrenewalInfo)
        purchase.transacted += 1
        await purchase.save()
        return recordedrenewalInfo
      }

      case 'requires_action': {
        throw new Error('Customer need to go through payment method approval.')
      }

      case 'canceled': {
        throw new Error('Payment was cancelled on the stripe side')
      }

      default:
        throw new Error('Payment did not suceed')
    }
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
