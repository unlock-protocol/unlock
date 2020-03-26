import { keyExpirationTimestampFor } from './keyExpirationTimestampFor'
import { optimisticUnlocking } from './optimisticUnlocking'
import { PaywallConfig } from '../unlockTypes'

interface ModuleConfig {
  readOnlyProvider: string
  locksmithUri: string
}

/**
 * A function which, given a user account, a paywall config will return a boolean
 * to indicate whether the user has Unlocked any of the locks.
 * It will first check for the existence of keys, and if no valid one has been found
 * it will check for pending transactions which might be optimistic.
 */
export const isUnlocked = async (
  userAccountAddress: string,
  paywallConfig: PaywallConfig,
  { readOnlyProvider, locksmithUri }: ModuleConfig
): Promise<boolean> => {
  const lockAddresses = Object.keys(paywallConfig.locks)
  const timeStamps = await Promise.all(
    lockAddresses.map(lockAddress => {
      return keyExpirationTimestampFor(
        readOnlyProvider,
        lockAddress,
        userAccountAddress!
      )
    })
  )

  // If any key is valid, we unlock the page
  if (timeStamps.some(val => val > new Date().getTime() / 1000)) {
    return true
  }

  // If not key exists on chain, let's see if we can be optimistic before locking the page.
  const optimistic = await optimisticUnlocking(
    readOnlyProvider,
    locksmithUri,
    Object.keys(paywallConfig.locks),
    userAccountAddress!
  )
  if (optimistic) {
    return true
  }

  // If no key exists, or no transaction exists which could be optimistic, we lock
  return false
}
export default {
  isUnlocked,
}
