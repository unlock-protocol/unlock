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

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey)
    this.keyPricer = new KeyPricer()
  }

  /**
   *  Updates the user associated with a given email address with the
   *  appropriate stripe customer id based on the provided token.
   *
   * @param token
   * @param emailAddress
   */
  async updateUserPaymentDetails(
    token: string,
    publicKey: ethereumAddress
  ): Promise<boolean> {
    let normalizedEthereumAddress = Normalizer.ethereumAddress(publicKey)

    try {
      let user = await UserReference.findOne({
        where: { publicKey: { [Op.eq]: normalizedEthereumAddress } },
        include: [{ model: User, attributes: ['publicKey'] }],
      })

      if (user) {
        let customer = await this.stripe.customers.create({
          email: user.emailAddress,
          source: token,
        })

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

  /**
   *  Charges an appropriately configured user with purchasing details, with the amount specified
   *  in the purchase details
   * @param publicKey
   * @param purchaseDetails
   */
  async chargeUser(publicKey: ethereumAddress, lock: ethereumAddress) {
    try {
      let normalizedPublicKey = Normalizer.ethereumAddress(publicKey)

      let user = await UserReference.findOne({
        where: { publicKey: normalizedPublicKey },
        include: [{ model: User, attributes: ['publicKey'] }],
      })

      if (user && user.stripe_customer_id) {
        let charge = await this.stripe.charges.create({
          amount: this.price(lock),
          currency: 'USD',
          customer: user.stripe_customer_id,
        })
        return charge
      } else {
        throw new Error('Customer lacks purchasing details')
      }
    } catch (error) {
      throw error
    }
  }

  price(lock: ethereumAddress): number {
    let itemizedPrice = this.keyPricer.generate(lock)
    return Object.values(itemizedPrice).reduce((a, b) => a + b)
  }

  initiatePurchase(
    purchaser: ethereumAddress,
    lock: ethereumAddress,
    credentials: string,
    providerHost: string
  ) {
    let successfulCharge = this.chargeUser(purchaser, lock)
    if (successfulCharge) {
      let fulfillmentDispatcher = new Dispatcher(
        'unlockAddress',
        purchaser,
        credentials,
        providerHost
      )
      fulfillmentDispatcher.purchase(lock, purchaser)
    }
  }
}

export default PaymentProcessor
