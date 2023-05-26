import { StripeConnectLock } from '../models/stripeConnectLock'
import { ethereumAddress } from '../types'
import * as Normalizer from '../utils/normalizer'
import { UserReference } from '../models/userReference'
import { StripeCustomer } from '../models/stripeCustomer'
import Sequelize from 'sequelize'
import stripe from '../config/stripe'
import logger from '../logger'
import Stripe from 'stripe'

const { Op } = Sequelize

export const createStripeCustomer = async (
  stripeToken: string | undefined,
  publicKey: string
): Promise<string> => {
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
    logger.error(error)
    return false
  }
}

/**
 * @deprecated
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
 */
export const disconnectStripe = async ({
  lockManager,
  lockAddress: lock,
  chain,
}: {
  lockManager: string
  lockAddress: string
  chain: number
}) => {
  const stripeConnectLockDetails = await StripeConnectLock.findOne({
    where: { lock },
  })

  let deletedItems = 0
  if (stripeConnectLockDetails) {
    const account = await stripe.accounts.retrieve(
      stripeConnectLockDetails.stripeAccount
    )

    // delete record from db to unlink stripe
    const deletedLockConnect = await StripeConnectLock.destroy({
      where: {
        lock,
        manager: lockManager,
        stripeAccount: account.id,
        chain,
      },
    })

    deletedItems = deletedLockConnect
  }
  return deletedItems > 0
}

/** Create a Stripe Account link that where user is redirected to connect stripe to the lock */
export const createStripeAccountLink = async ({
  baseUrl,
  network,
  lockAddress,
  lockManager,
}: {
  baseUrl: string
  network: number
  lockAddress: string
  lockManager: string
}): Promise<any> => {
  const stripeConnectLockDetails = await StripeConnectLock.findOne({
    where: { lock: lockAddress },
  })

  let account
  if (!stripeConnectLockDetails) {
    // This is a new one
    account = await stripe.accounts.create({
      type: 'standard',
      metadata: {
        manager: lockManager,
      },
    })

    await StripeConnectLock.create({
      lock: lockAddress,
      manager: lockManager,
      stripeAccount: account.id,
      chain: network,
    })
  } else {
    // Retrieve it from Stripe!
    account = await stripe.accounts.retrieve(
      stripeConnectLockDetails.stripeAccount
    )
  }

  return stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseUrl}/locks/settings?address=${lockAddress}&network=${network}&stripe=0&defaultTab=payments`,
    return_url: `${baseUrl}/locks/settings?address=${lockAddress}&network=${network}&stripe=1&defaultTab=payments`,
    type: 'account_onboarding',
  })
}

/**
 * Connects a Stripe account to a lock
 * Do we want to store this?
 */
export const connectStripe = async (
  lockManager: string,
  lock: string,
  chain: number,
  baseUrl: string,
  stripeAccount?: string
) => {
  if (stripeAccount) {
    // Check the validity!
    const account = await stripeConnection(stripeAccount)
    if (account?.charges_enabled) {
      await StripeConnectLock.create({
        lock,
        manager: lockManager,
        stripeAccount,
        chain,
      })
    } else if (account) {
      // account connected but charges not enabled, need to return  link to resume stripe setup
      return await createStripeAccountLink({
        baseUrl,
        network: chain,
        lockAddress: lock,
        lockManager,
      })
    } else {
      // no valid account
      throw new Error('Invalid Stripe Account')
    }
    // Nothing expected!
    return
  } else {
    return await createStripeAccountLink({
      baseUrl,
      network: chain,
      lockAddress: lock,
      lockManager,
    })
  }
}

/**
 * Lists the connects by a lock manager
 * @param manager
 */
export const getConnectionsForManager = async (manager: string) => {
  return StripeConnectLock.findAll({
    where: { manager },
  })
}

export const getStripeConnectLockDetails = async (
  lockAddress: string,
  network: number
) => {
  const stripeConnectLockDetails = await StripeConnectLock.findOne({
    where: { lock: lockAddress, chain: network },
  })
  return stripeConnectLockDetails
}

/**
 * Get stripe connect account to lock & enabled status
 * Returns `stripeEnable` as true when connection details is present
 * Returns `stripeAccount` only when connection details are present
 */
export const getStripeConnectForLock = async (
  lock: string,
  chain: number
): Promise<{ stripeAccount?: string; stripeEnabled: boolean }> => {
  const stripeConnectLockDetails = await getStripeConnectLockDetails(
    lock,
    chain
  )

  if (!stripeConnectLockDetails?.stripeAccount) {
    return {
      stripeEnabled: false,
    }
  }

  const account = await stripeConnection(stripeConnectLockDetails.stripeAccount)

  return {
    stripeEnabled: account?.charges_enabled ?? false,
    stripeAccount: stripeConnectLockDetails.stripeAccount,
  }
}

export const stripeConnection = async (
  stripeAccount: string
): Promise<Stripe.Account | null> => {
  let account = null
  try {
    account = await stripe.accounts.retrieve(stripeAccount)
  } catch (error) {
    console.error(error)
  }
  return account
}

export default {
  deletePaymentDetailsForAddress,
  getStripeCustomerIdForAddress,
  saveStripeCustomerIdForAddress,
  connectStripe,
  getStripeConnectForLock,
  disconnectStripe,
  getConnectionsForManager,
}
