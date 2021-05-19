import Stripe from 'stripe'
import { User } from '../models/user'
import { UserReference } from '../models/userReference'
import * as Normalizer from '../utils/normalizer'
import KeyPricer from '../utils/keyPricer'
import { ethereumAddress } from '../types' // eslint-disable-line import/named, no-unused-vars
import Dispatcher from '../fulfillment/dispatcher'
import {
  getStripeCustomerIdForAddress,
  saveStripeCustomerIdForAddress,
} from '../operations/stripeOperations'

const Sequelize = require('sequelize')

const { Op } = Sequelize
export class PaymentProcessor {
  stripe: Stripe

  keyPricer: KeyPricer

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey)
    this.keyPricer = new KeyPricer()
  }

  // eslint-disable-next-line class-methods-use-this
  async findUserByPublicKey(publicKey: ethereumAddress) {
    const normalizedEthereumAddress = Normalizer.ethereumAddress(publicKey)

    return UserReference.findOne({
      where: { publicKey: { [Op.eq]: normalizedEthereumAddress } },
      include: [{ model: User, attributes: ['publicKey'] }],
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
        await this.stripe.customers.createSource(stripeCustomerId, {
          source: token,
        })

        return true
      }

      const customer = await this.stripe.customers.create({
        email: user ? user.emailAddress : '', // The stripe API does not require a valid email to be passed
        source: token,
      })

      if (!customer) {
        return false
      }

      return !!(await saveStripeCustomerIdForAddress(publicKey, customer.id))
    } catch (e) {
      return false
    }
  }

  /**
   *  Charges an appropriately configured user with purchasing details, with the amount specified
   *  in the purchase details
   * @param userAddress
   * @param purchaseDetails
   */
  async chargeUserForConnectedAccount(
    userAddress: ethereumAddress,
    stripeCustomerId: string,
    lock: ethereumAddress,
    // eslint-disable-next-line no-unused-vars
    connectedStripeId: string,
    network: number
  ) {
    // Otherwise get the pricing to continue
    const pricing = await new KeyPricer().generate(lock, network)
    const totalPriceInCents = Object.values(pricing).reduce((a, b) => a + b)

    const charge = await this.stripe.charges.create(
      {
        amount: totalPriceInCents,
        currency: 'USD',
        customer: stripeCustomerId,
        metadata: { lock, userAddress },
        application_fee_amount: pricing.unlockServiceFee,
      },
      {
        stripe_account: connectedStripeId,
      }
    )
    return charge
  }

  async initiatePurchaseForConnectedStripeAccount(
    recipient: ethereumAddress /** this is the recipient of the granted key */,
    stripeCustomerId: string, // Stripe token of the buyer
    lock: ethereumAddress,
    connectedStripeAccount: string,
    network: number
  ) {
    const fulfillmentDispatcher = new Dispatcher()

    const successfulCharge = await this.chargeUserForConnectedAccount(
      recipient,
      stripeCustomerId,
      lock,
      connectedStripeAccount,
      network
    )
    if (successfulCharge) {
      // TODO: Also save stripeCustomerId!
      return fulfillmentDispatcher.grantKey(
        lock,
        recipient,
        network
        // (error, hash) => {
        //   // Save transaction hash + purchasing info!
        // }
      )
    }
    return null
  }
}

export default PaymentProcessor
