import Stripe from 'stripe'
import { User } from '../models/user'
import { UserReference } from '../models/userReference'
import * as Normalizer from '../utils/normalizer'
import KeyPricer from '../utils/keyPricer'
import { ethereumAddress } from '../types' // eslint-disable-line import/named, no-unused-vars
import Dispatcher from '../fulfillment/dispatcher'

const Sequelize = require('sequelize')

const Op = Sequelize.Op

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

  async findUserByPublicKey(publicKey: ethereumAddress) {
    let normalizedEthereumAddress = Normalizer.ethereumAddress(publicKey)

    return UserReference.findOne({
      where: { publicKey: { [Op.eq]: normalizedEthereumAddress } },
      include: [{ model: User, attributes: ['publicKey'] }],
    })
  }

  /**
   *  appropriate stripe customer id based on the provided token.
   *
   * @param token
   * @param emailAddress
   */
  async updateUserPaymentDetails(
    token: string,
    publicKey: ethereumAddress
  ): Promise<boolean> {
    try {
      let user = await this.findUserByPublicKey(publicKey)

      if (user && user.stripe_customer_id) {
        await this.stripe.customers.createSource(user.stripe_customer_id, {
          source: token,
        })

        return true
      } else if (user && !user.stripe_customer_id) {
        let customer = await this.createStripeCustomer(user.emailAddress, token)
        user.stripe_customer_id = customer.id
        await user.save()
        return true
      } else {
        return false
      }
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
    try {
      let user = await this.findUserByPublicKey(publicKey)

      if (user && user.stripe_customer_id) {
        let charge = await this.stripe.charges.create({
          amount: await this.price(lock),
          currency: 'USD',
          customer: user.stripe_customer_id,
          metadata: { lock: lock, publicKey: publicKey },
        })
        return charge
      } else {
        throw new Error('Customer lacks purchasing details')
      }
    } catch (error) {
      throw error
    }
  }

  async price(lock: ethereumAddress): Promise<number> {
    let itemizedPrice = await this.keyPricer.generate(lock)
    return Object.values(itemizedPrice).reduce((a, b) => a + b)
  }

  async initiatePurchase(
    recipient: ethereumAddress /** this is the managed user/buyer */,
    lock: ethereumAddress,
    credentials: string,
    providerHost: string,
    buyer: ethereumAddress
  ) {
    let successfulCharge = await this.chargeUser(recipient, lock)
    if (successfulCharge) {
      let fulfillmentDispatcher = new Dispatcher(
        'unlockAddress',
        credentials,
        providerHost,
        buyer
      )

      await fulfillmentDispatcher.purchase(lock, recipient)
    }
  }
}

export default PaymentProcessor
