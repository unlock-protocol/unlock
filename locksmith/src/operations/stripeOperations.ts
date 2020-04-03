import { ethereumAddress } from '../types' // eslint-disable-line import/named, no-unused-vars
import * as Normalizer from '../utils/normalizer'
import { UserReference } from '../models/userReference'

import { StripeCustomer } from '../models/stripeCustomer'

const Sequelize = require('sequelize')

const { Op } = Sequelize

/**
 * Method, which, given a publicKey, returns the stripe token id
 * This does a double look up as we changed how stripe token ids are stored (used to be in UserReferences and are now in their own table)
 * @param publicKey
 */
export const getStripeCustomerIdForAddress = async (
  publicKey: ethereumAddress
) => {
  const normalizedEthereumAddress = Normalizer.ethereumAddress(publicKey)

  // First, let's try in the StripeCustomer
  const stripeCustomer = await StripeCustomer.findOne({
    where: { publicKey: { [Op.eq]: normalizedEthereumAddress } },
  })

  if (stripeCustomer && stripeCustomer.StripeCustomerId) {
    return stripeCustomer.StripeCustomerId
  }

  // Otherwise, check UserReference
  // Note: this is deprecated. At some point we should finish the migration
  // and delete that row!
  const userReference = await UserReference.findOne({
    where: { publicKey: { [Op.eq]: normalizedEthereumAddress } },
  })
  if (!userReference) {
    return null
  }
  return userReference.stripe_customer_id
}

/**
 * Method whichs saves a stripe customer id!
 * @param publicKey
 * @param stripeCustomerId
 */
export const saveStripeCustomerIdForAddress = async (
  publicKey: ethereumAddress,
  stripeCustomerId: string
) => {
  const normalizedEthereumAddress = Normalizer.ethereumAddress(publicKey)

  return await StripeCustomer.create({
    publicKey: normalizedEthereumAddress,
    stripeCustomerId: stripeCustomerId,
  })
}
