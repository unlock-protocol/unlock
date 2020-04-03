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

  constructor(
    apiKey: string,
    providerURL: string,
    unlockContractAddress: string
  ) {
    this.stripe = new Stripe(apiKey)
    this.keyPricer = new KeyPricer(providerURL, unlockContractAddress)
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

      if (user && stripeCustomerId) {
        await this.stripe.customers.createSource(stripeCustomerId, {
          source: token,
        })

        return true
      }
      if (user && !stripeCustomerId) {
        const customer = await this.createStripeCustomer(
          user.emailAddress,
          token
        )
        return !!(await saveStripeCustomerIdForAddress(publicKey, customer.id))
      }
      return false
    } catch (e) {
      return false
    }
  }

  createStripeCustomer(emailAddress: string, token: string) {
    return this.stripe.customers.create({
      email: emailAddress,
      source: token,
    })
  }

  /**
   *  Charges an appropriately configured user with purchasing details, with the amount specified
   *  in the purchase details
   * @param publicKey
   * @param purchaseDetails
   */
  async chargeUser(publicKey: ethereumAddress, lock: ethereumAddress) {
    // eslint-disable-next-line no-useless-catch
    try {
      const user = await this.findUserByPublicKey(publicKey)
      const stripeCustomerId = await getStripeCustomerIdForAddress(publicKey)

      if (user && stripeCustomerId) {
        const charge = await this.stripe.charges.create({
          amount: await this.price(lock),
          currency: 'USD',
          customer: stripeCustomerId,
          metadata: { lock, publicKey },
        })
        return charge
      }
      throw new Error('Customer lacks purchasing details')
    } catch (error) {
      throw error
    }
  }

  async price(lock: ethereumAddress): Promise<number> {
    const itemizedPrice = await this.keyPricer.generate(lock)
    return Object.values(itemizedPrice).reduce((a, b) => a + b)
  }

  async isKeyFree(lock: ethereumAddress): Promise<boolean> {
    const keyPrice = await this.keyPricer.keyPrice(lock)
    return keyPrice === 0
  }

  async initiatePurchase(
    recipient: ethereumAddress /** this is the managed user/buyer */,
    lock: ethereumAddress,
    credentials: string,
    providerHost: string,
    buyer: ethereumAddress
  ) {
    const fulfillmentDispatcher = new Dispatcher(
      'unlockAddress',
      credentials,
      providerHost,
      buyer
    )

    if (await this.isKeyFree(lock)) {
      return fulfillmentDispatcher.purchase(lock, recipient)
    }
    const successfulCharge = await this.chargeUser(recipient, lock)
    if (successfulCharge) {
      return fulfillmentDispatcher.purchase(lock, recipient)
    }
    return null
  }
}

export default PaymentProcessor
