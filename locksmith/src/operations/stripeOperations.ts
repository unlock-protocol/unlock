import Stripe from 'stripe'

import { StripeConnectLock } from '../models/stripeConnectLock'
import { ethereumAddress } from '../types' // eslint-disable-line import/named, no-unused-vars
import * as Normalizer from '../utils/normalizer'
import { UserReference } from '../models/userReference'

import { StripeCustomer } from '../models/stripeCustomer'

const Sequelize = require('sequelize')

const { Op } = Sequelize
const config = require('../../config/config')

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
  try {
    return await StripeCustomer.create({
      publicKey: normalizedEthereumAddress,
      StripeCustomerId: stripeCustomerId,
    })
  } catch (error) {
    return false
  }
}

/**
 * Method which delets the stripe customer id for an address
 */
export const deletePaymentDetailsForAddress = async (
  publicKey: ethereumAddress
) => {
  const normalizedEthereumAddress = Normalizer.ethereumAddress(publicKey)

  // First, let's delete the StripeCustomer
  const deletedStripeCustomer = await StripeCustomer.destroy({
    where: { publicKey: { [Op.eq]: normalizedEthereumAddress } },
  })

  // Then, update UserReference
  // TODO: deprecate when all stripe_customer_id UserReferences have been moved to use StripeCustomer
  const [updatedUserReference] = await UserReference.update(
    {
      stripe_customer_id: null,
    },
    {
      where: { publicKey: { [Op.eq]: normalizedEthereumAddress } },
    }
  )

  return deletedStripeCustomer > 0 || updatedUserReference > 0
}

/**
 * Connects a Stripe account to a lock
 * Do we want to store this?
 */
export const connectStripe = async (
  lockManager: string,
  lock: string,
  chain: number,
  baseUrl: string
) => {
  const stripe = new Stripe(config.stripeSecret, {
    apiVersion: '2020-08-27',
  })

  const stripeConnectLockDetails = await StripeConnectLock.findOne({
    where: { lock },
  })
  let account
  if (!stripeConnectLockDetails) {
    // This is a new one
    account = await stripe.accounts.create({
      type: 'standard',
      metadata: {
        lock,
        manager: lockManager,
        chain,
      },
    })

    await StripeConnectLock.create({
      lock,
      manager: lockManager,
      stripeAccount: account.id,
      chain,
    })
  } else {
    // Retrieve it from Stripe!
    account = await stripe.accounts.retrieve(
      stripeConnectLockDetails.stripeAccount
    )
  }

  return await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseUrl}/stripeconnect?lock=${lock}&network=${chain}&completed=0`,
    return_url: `${baseUrl}/stripeconnect?lock=${lock}&network=${chain}&completed=1`,
    type: 'account_onboarding',
  })
}

export default {
  deletePaymentDetailsForAddress,
  getStripeCustomerIdForAddress,
  saveStripeCustomerIdForAddress,
  connectStripe,
}
