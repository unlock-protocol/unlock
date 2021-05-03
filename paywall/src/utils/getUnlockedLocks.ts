import { keyExpirationTimestampFor } from './keyExpirationTimestampFor'
import { optimisticLocks } from './optimisticUnlocking'
import { PaywallConfig } from '../unlockTypes'

interface ModuleConfig {
  readOnlyProvider: string
  locksmithUri: string
}

/**
 * A function which, given a user account, a paywall config will return an array of lock addresses
 * to indicate which locks the user has unlocked.
 * It will first check for the existence of keys, and if no valid one has been found
 * it will check for pending transactions which might be optimistic.
 */
export const getUnlockedLocks = async (
  userAccountAddress: string,
  paywallConfig: PaywallConfig,
  { readOnlyProvider, locksmithUri }: ModuleConfig
): Promise<string[]> => {
  const lockAddresses = Object.keys(paywallConfig.locks)
  const timeStampsByLock: Record<string, number> = {}
  lockAddresses.map(async (lockAddress) => {
    timeStampsByLock[lockAddress] = await keyExpirationTimestampFor(
      readOnlyProvider,
      lockAddress,
      userAccountAddress!
    )
  })

  const unlockedLocks = Object.keys(timeStampsByLock).filter(
    (lockAddress) => timeStampsByLock[lockAddress] > new Date().getTime() / 1000
  )

  if (!paywallConfig.pessimistic) {
    // Add optimistically unlocked lock addresses
    const additionalLocks = await optimisticLocks(
      readOnlyProvider,
      locksmithUri,
      lockAddresses.filter(
        (lockAddress) => unlockedLocks.indexOf(lockAddress) < 0
      ),
      userAccountAddress!
    )

    if (additionalLocks.length > 0) {
      unlockedLocks.push(...additionalLocks)
    }
  }

  return unlockedLocks
}
export default {
  getUnlockedLocks,
}
