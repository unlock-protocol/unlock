import { RawLocks } from '../../unlockTypes'
import { KeyResult } from './blockChainTypes'

// 24 hours, in seconds. Used as the default expiration if we don't know the
// expiration duration of the lock. Structured like a lock is to simplify code.
export const defaultExpiration = {
  expirationDuration: 60 * 60 * 24,
}

export const currentTimeInSeconds = () => Math.floor(Date.now() / 1000)

/**
 * When we receive new key purchases, we create temporary valid keys that will
 * be used to unlock the paywall until the transaction is mined.
 */
const createTemporaryKey = (
  lock: string,
  owner: string,
  locks: RawLocks
): KeyResult => {
  // Use default expiration if we don't have the lock information.
  const { expirationDuration } = locks[lock] || defaultExpiration

  const expiration = currentTimeInSeconds() + expirationDuration

  return {
    lock,
    owner,
    expiration,
  }
}

export default createTemporaryKey
