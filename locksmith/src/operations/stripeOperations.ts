import Stripe from 'stripe'

import { StripeConnectLock } from '../models/stripeConnectLock'
import { ethereumAddress } from '../types'
import * as Normalizer from '../utils/normalizer'
import { UserReference } from '../models/userReference'

import { StripeCustomer } from '../models/stripeCustomer'

const Sequelize = require('sequelize')

const { Op } = Sequelize
const config = require('../../config/config')

export const createStripeCustomer = async (
  stripeToken: string,
  publicKey: string
): Promise<string> => {
  const stripe = new Stripe(config.stripeSecret, {
    apiVersion: '2020-08-27',
  })
  const customer = await stripe.customers.create({
    source: stripeToken,
    metadata: {
      publicKey,
    },
  })
  await saveStripeCustomerIdForAddress(publicKey, customer.id)
  return customer.id
}
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
    where: { publicKey: normalizedEthereumAddress },
  })

  return stripeCustomer?.StripeCustomerId
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
 * Remove stripe account connected to a lock
 * Do we want to store this?
 */
export const unlinkStripe = async ({
  lockManager,
  lock,
  chain,
}: {
  lockManager: string
  lock: string
  chain: number
}) => {
  const stripe = new Stripe(config.stripeSecret, {
    apiVersion: '2020-08-27',
  })

  const stripeConnectLockDetails = await StripeConnectLock.findOne({
    where: { lock },
  })

  if (stripeConnectLockDetails) {
    const account = await stripe.accounts.retrieve(
      stripeConnectLockDetails.stripeAccount
    )

    // delete stripe connection with SDK and to Database
    await stripe.accounts.deletePerson(account.id, lock)
    await StripeConnectLock.destroy({
      where: {
        lock,
        manager: lockManager,
        stripeAccount: account.id,
        chain,
      },
    })
  }
  return Promise.resolve()
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
    refresh_url: `${baseUrl}/dashboard?lock=${lock}&network=${chain}&stripe=0`,
    return_url: `${baseUrl}/dashboard?lock=${lock}&network=${chain}&stripe=1`,
    type: 'account_onboarding',
  })
}

/**
 * Get stripe connect account to lock
 * Returns -1 if no Stripe is connected
 * Return 0 if a Stripe account is connected, but not ready to process charges
 * Returns the stripeAccount if all fully enabled
 */
export const getStripeConnectForLock = async (lock: string, chain: number) => {
  const stripe = new Stripe(config.stripeSecret, {
    apiVersion: '2020-08-27',
  })
  const stripeConnectLockDetails = await StripeConnectLock.findOne({
    where: { lock, chain },
  })

  if (!stripeConnectLockDetails?.stripeAccount) {
    return -1
  }

  const account = await stripe.accounts.retrieve(
    stripeConnectLockDetails.stripeAccount
  )

  if (account.charges_enabled) {
    return stripeConnectLockDetails.stripeAccount
  }

  return 0
}

export default {
  deletePaymentDetailsForAddress,
  getStripeCustomerIdForAddress,
  saveStripeCustomerIdForAddress,
  connectStripe,
  getStripeConnectForLock,
  unlinkStripe,
}
