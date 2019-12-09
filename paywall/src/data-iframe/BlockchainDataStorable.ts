import { RawLocks, KeyResults, KeyResult, Transactions } from '../unlockTypes'
import { normalizeLockAddress } from '../utils/normalizeAddresses'

/**
 * This is a mixin class that handles most storage of blockchain data
 * as used in BlockchainHandler. Since it doesn't do anything on its
 * own, it can also serve as an implementation of the null object
 * pattern for BlockchainHandler.
 */
export class BlockchainDataStorable {
  locks: RawLocks = {}
  keys: KeyResults = {}
  transactions: Transactions = {}

  updateLock = (lockAddress: string, update: any) => {
    const normalizedAddress = normalizeLockAddress(lockAddress)

    const currentLock = this.locks[normalizedAddress] || {}

    this.locks[normalizedAddress] = {
      ...currentLock,
      ...update,
      // `update` may contain the lock address -- this way we always
      // use the normalized address instead of accidentally
      // overwriting.
      address: normalizedAddress,
    }
  }

  updateKey = (_: any, key: KeyResult) => {
    const normalizedAddress = normalizeLockAddress(key.lock)
    const normalizedOwnerAddress = normalizeLockAddress(key.owner)

    this.keys[normalizedAddress] = {
      expiration: key.expiration,
      owner: normalizedOwnerAddress,
      lock: normalizedAddress,
    }
  }

  updateTransaction = (hash: string, update: any) => {
    if (update.lock) {
      // ensure all references to locks are normalized
      update.lock = normalizeLockAddress(update.lock)
    }
    if (update.to) {
      // ensure all references to locks are normalized
      update.to = normalizeLockAddress(update.to)
    }

    const currentTransaction = this.transactions[hash] || {}

    this.transactions[hash] = {
      ...currentTransaction,
      ...update,
    }
  }
}
