import stripe from '../config/stripe'

import { User } from '../models/user'
import { Charge } from '../models/charge'
import { PaymentIntent } from '../models/paymentIntent'
import { UserReference } from '../models/userReference'
import * as Normalizer from '../utils/normalizer'
import KeyPricer from '../utils/keyPricer'
import { ethereumAddress } from '../types'
import {
  getStripeCustomerIdForAddress,
  saveStripeCustomerIdForAddress,
} from '../operations/stripeOperations'
import { getSettings } from '../operations/lockSettingOperations'
import logger from '../logger'
import { Op, Sequelize } from 'sequelize'
import { createPricingForPurchase } from '../utils/pricing'

export class PaymentProcessor {
  keyPricer: KeyPricer

  constructor() {
    this.keyPricer = new KeyPricer()
  }

  async findUserByPublicKey(publicKey: ethereumAddress) {
    const normalizedEthereumAddress = Normalizer.ethereumAddress(publicKey)

    return UserReference.findOne({
      where: { publicKey: { [Op.eq]: normalizedEthereumAddress } },
      include: [{ model: User, attributes: ['publicKey'], as: 'User' }],
    })
  }

  /**
   *  appropriate stripe customer id based on the provided token.
   * @param token
   * @param emailAddress
   */
  async updateUserPaymentDetails(
    token: string,
    publicKey: ethereumAddress
  ): Promise<boolean> {
    try {
      const user = await this.findUserByPublicKey(publicKey)
      const stripeCustomerId = await getStripeCustomerIdForAddress(publicKey)

      // If we already have a stripe customer id
      if (stripeCustomerId) {
        await stripe.customers.createSource(stripeCustomerId, {
          source: token,
        })

        return true
      }

      const customer = await stripe.customers.create({
        email: user ? user.emailAddress : '', // The stripe API does not require a valid email to be passed
        source: token,
      })

      if (!customer) {
        return false
      }

      return !!(await saveStripeCustomerIdForAddress(publicKey, customer.id))
    } catch (error) {
      logger.error(
        `Failed to update payment details for ${publicKey}: there was an error.`,
        error
      )
      return false
    }
  }

  async createPaymentIntent(
    userAddress: ethereumAddress,
    recipients: ethereumAddress[],
    stripeCustomerId: string, // Stripe token of the buyer
    lock: ethereumAddress,
    maxPrice: number,
    network: number,
    stripeAccount: string,
    recurring: number = 0,
    data?: (string | null)[] | null,
    referrers?: (string | null)[] | null
  ) {
    const pricing = await createPricingForPurchase({
      lockAddress: lock,
      recipients,
      network,
      referrers: referrers || [],
      data: data || [],
    })
    if (!pricing) {
      throw new Error('We could not compute the pricing.')
    }

    if (Math.abs(pricing.total * 100 - maxPrice) > 0.03 * maxPrice) {
      // if price diverged by more than 3%, we fail!
      throw new Error('Price diverged by more than 3%. Aborting')
    }

    // Let's see if we have a paymentIntent already that's less than 10 minutes old
    const existingIntent = await PaymentIntent.findOne({
      where: {
        userAddress,
        lockAddress: lock,
        chain: network,
        connectedStripeId: stripeAccount,
        createdAt: {
          [Op.gte]: Sequelize.literal("NOW() - INTERVAL '10 minute'"),
        },
      },
    })

    // We check if there is an intent and use that one
    // if its status is still pending confirmation
    if (
      existingIntent &&
      existingIntent.recipients?.every((recipient) =>
        recipients.includes(recipient)
      )
    ) {
      const stripeIntent = await stripe.paymentIntents.retrieve(
        existingIntent.intentId,
        {
          stripeAccount: existingIntent.connectedStripeId,
        }
      )
      if (stripeIntent.status === 'requires_confirmation') {
        return {
          clientSecret: stripeIntent.client_secret,
          stripeAccount,
          pricing,
          totalPriceInCents: pricing.total * 100,
        }
      }
    }

    const globalPaymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    })

    const primaryMethod = globalPaymentMethods.data[0]

    // Clone payment method
    const method = await stripe.paymentMethods.create(
      {
        payment_method: primaryMethod.id,
        customer: stripeCustomerId,
      },
      {
        stripeAccount,
      }
    )

    // Find existing customer with the user address in the metadata
    const customers = await stripe.customers.search(
      {
        query: `metadata["userAddress"]:"${userAddress}"`,
      },
      {
        stripeAccount,
      }
    )

    let connectedCustomer = customers.data[0]

    if (!connectedCustomer) {
      // Clone customer if no customer with user address in the metadata exists.
      connectedCustomer = await stripe.customers.create(
        {
          payment_method: method.id,
          metadata: {
            userAddress,
          },
        },
        { stripeAccount }
      )
    }
    const account = await stripe.accounts.retrieve({
      stripeAccount,
    })

    const applicationFeeNotSupportedCountries = [
      'BR',
      'IN',
      'MX',
      'MY',
      'SG',
      'TH',
    ]

    // retrieve lock currency
    const { creditCardCurrency = 'usd' } = await getSettings({
      lockAddress: lock,
      network,
    })

    const paymentIntentParams: any = {
      amount: Math.ceil(pricing.total * 100),
      currency: creditCardCurrency,
      customer: connectedCustomer.id,
      payment_method: method.id,
      capture_method: 'manual', // We need to confirm on front-end but will capture payment back on backend.
      receipt_email: '',
      metadata: {
        purchaser: userAddress,
        lock,
        recurring,
        recipient: recipients.join(','),
        network,
        // Not actually saving these in Stripe because of size limitations on their side.
        // data: (data || []).join(','),
        // referrers: (referrers || []).join(','),
        // For compaitibility and stripe limitation (cannot store an array), we are using the same recipient field name but storing multiple recipients in case we have them.
        // maxPrice,
      },
      application_fee_amount: !applicationFeeNotSupportedCountries.includes(
        account.country?.trim() || ''
      )
        ? Math.ceil(pricing.unlockServiceFee * 100 + pricing.gasCost * 100)
        : undefined,
    }
    if (connectedCustomer.email) {
      paymentIntentParams['receipt_email'] = connectedCustomer.email
    } else if (method.billing_details?.email) {
      paymentIntentParams['receipt_email'] = method.billing_details.email
    }

    const intent = await stripe.paymentIntents.create(paymentIntentParams, {
      stripeAccount,
    })

    // Store the paymentIntent
    // Note: to avoid multiple purchases, we should make sure we don't create a new one if one already exists!
    await PaymentIntent.create({
      userAddress,
      lockAddress: lock,
      chain: network,
      recipients,
      stripeCustomerId: stripeCustomerId, // Unlock "global" Customer Id
      intentId: intent.id,
      connectedStripeId: stripeAccount, // connected account
      connectedCustomerId: connectedCustomer.id, // connected Customer Id
    })

    return {
      clientSecret: intent.client_secret,
      stripeAccount,
      totalPriceInCents: pricing.total * 100,
      pricing,
    }
  }

  async createSetupIntent({ customerId }: { customerId: string }) {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card', 'link'],
    })
    return {
      clientSecret: setupIntent.client_secret,
    }
  }

  async listCardMethods({ customerId }: { customerId: string }) {
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
    return methods.data
  }

  async getPaymentIntentRecordAndCharge({
    userAddress,
    lockAddress,
    recipients,
    network,
    paymentIntentId,
    data,
    referrers,
  }: {
    userAddress: ethereumAddress
    lockAddress: ethereumAddress
    recipients: ethereumAddress[]
    network: number
    paymentIntentId: string
    referrers: (string | null)[]
    data: (string | null)[]
  }) {
    const pricing = await createPricingForPurchase({
      lockAddress,
      recipients,
      network,
      referrers,
      data,
    })
    if (!pricing) {
      throw new Error('Could not compute the pricing.')
    }

    const totalPriceInCents = pricing.total * 100

    const paymentIntentRecord = await PaymentIntent.findOne({
      where: { intentId: paymentIntentId },
    })

    if (!paymentIntentRecord) {
      throw new Error('Could not find payment intent.')
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        stripeAccount: paymentIntentRecord.connectedStripeId,
      }
    )

    if (paymentIntent.status !== 'requires_capture') {
      throw new Error(
        'Stripe payment could not be captured, please refresh and try again'
      )
    }

    if (paymentIntent.metadata.lock !== lockAddress) {
      throw new Error('Lock does not match with initial intent.')
    }

    if (paymentIntent.metadata.purchaser !== userAddress) {
      throw new Error('User Address does not match with initial intent.')
    }

    if (
      !paymentIntent.metadata.recipient
        .split(',')
        .every((r) => recipients.includes(r))
    ) {
      throw new Error('Recipient does not match with initial intent.')
    }

    const maxPriceInCents = paymentIntent.amount
    if (
      Math.abs(totalPriceInCents - maxPriceInCents) >
      0.03 * maxPriceInCents
    ) {
      // if price diverged by more than 3%, we fail!
      logger.error('Price diverged by more than 3%', {
        totalPriceInCents,
        maxPriceInCents,
      })
      throw new Error('Price diverged by more than 3%.')
    }

    // Create the charge object on our end!
    const charge: Charge = await Charge.create({
      userAddress: paymentIntent.metadata.purchaser,
      recipients: paymentIntent.metadata.recipient.split(','),
      lock: paymentIntent.metadata.lock,
      stripeCustomerId: paymentIntent.customer?.toString(), // TODO: consider checking the customer id under Unlock's stripe account?
      connectedCustomer: paymentIntent.customer?.toString(),
      totalPriceInCents: paymentIntent.amount,
      unlockServiceFee: paymentIntent.application_fee_amount,
      stripeCharge: paymentIntent.id,
      recurring: parseInt(paymentIntent.metadata.recurring),
      chain: network,
    })

    return {
      paymentIntent,
      paymentIntentRecord,
      charge,
    }
  }

  async removePaymentMethods({ customerId }: { customerId: string }) {
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
    for (const method of methods.data) {
      await stripe.paymentMethods.detach(method.id)
    }
  }
}

export default PaymentProcessor
