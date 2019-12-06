/**
 * This file is a thinner, leaner iteration on the data-iframe portion
 * of the paywall application. When completed, it will deprecate the
 * Mailbox.ts file and the blockchainHandler/ directory
 */

import { getTransactionsFor } from './locksmith-helpers'
import {
  RawLocks,
  KeyResults,
  KeyResult,
  Transactions,
  TransactionStatus,
  TransactionType,
} from '../unlockTypes'
import { normalizeLockAddress } from '../utils/normalizeAddresses'

export class BlockchainHandler {
  locks: RawLocks = {}
  keys: KeyResults = {}
  transactions: Transactions = {}
  accountAddress: string

  // The list of lock addresses from the paywall configuration
  lockAddresses: string[]
  // TODO: provide types from unlock-js
  web3Service: any

  /**
   * BlockchainHandler can be constructed immediately when there is an
   * available web3Service, but it doesn't do anything until
   * initialized with lock addresses from the configuration and the
   * user's account address.
   *
   * The state cannot be reset. If any condition occurs (e.g. account
   * address changed) which invalidates data, this object should be
   * destroyed and replaced with a new one.
   */
  constructor(
    web3Service: any,
    lockAddresses: string[],
    accountAddress: string
  ) {
    this.web3Service = web3Service
    this.lockAddresses = lockAddresses
    this.accountAddress = accountAddress

    // Add web3service event listeners
    this.web3Service.on('lock.updated', this.updateLock)
    this.web3Service.on('key.updated', this.updateKey)
    this.web3Service.on('transaction.updated', this.updateTransaction)

    this.lockAddresses.forEach(lockAddress => {
      this.web3Service.getLock(lockAddress)
      this.web3Service.getKeyByLockForOwner(lockAddress, this.accountAddress)
    })
  }

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

  getTransactionsFromLocksmith = async () => {
    const transactions = await getTransactionsFor(
      this.accountAddress,
      this.lockAddresses
    )
    transactions.forEach(transaction => {
      this.transactions[transaction.hash] = {
        hash: transaction.hash,
        status: TransactionStatus.SUBMITTED,
        confirmations: 0,
        blockNumber: Number.MAX_SAFE_INTEGER,
        type: TransactionType.KEY_PURCHASE,
      }

      this.web3Service
        .getTransaction(
          transaction.hash,
          transaction.input ? transaction : undefined
        )
        .catch(() => {
          // For now, ignore failure: this means locksmith knows of a transaction
          // which does not exist. Probably stale?
          // eslint-disable-next-line no-console
          console.error(
            `unable to retrieve saved transaction from blockchain: ${transaction.hash}`
          )
        })
    })
  }
}
