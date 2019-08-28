import { currentTimeInSeconds } from '../../utils/durations'
import { RawLock } from '../../unlockTypes'
import { KeyResult } from './blockChainTypes'

// 24 hours, in seconds. Used as the default expiration if we don't know the
// expiration duration of the lock. Structured like a lock is to simplify code.
export const defaultExpiration = {
  expirationDuration: 60 * 60 * 24,
}

/**
 * When we receive new key purchases, we create temporary valid keys that will
 * be used to unlock the paywall until the transaction is mined.
 */
export const createTemporaryKey = (
  lockAddress: string,
  owner: string,
  lock: RawLock | undefined
): KeyResult => {
  // Use default expiration if we don't have the lock information.
  const { expirationDuration } = lock || defaultExpiration

  const expiration = currentTimeInSeconds() + expirationDuration

  return {
    lock: lockAddress,
    owner,
    expiration,
  }
}

// This allows us to use jest.spyOn with the exports
const main = {
  createTemporaryKey,
  currentTimeInSeconds,
  defaultExpiration,
}

export default main
