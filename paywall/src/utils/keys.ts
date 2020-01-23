import {
  KeyStatus,
  KeyResult,
  Transactions,
  Transaction,
  TransactionStatus,
} from '../unlockTypes'
import { isValidKey } from '../data-iframe/blockchainHandler/keyStatus'

export function getTransactionsFor(
  transactions: Transactions,
  key: KeyResult
): Transaction[] {
  return Object.values(transactions).filter(tx => tx.lock === key.lock)
}

export function getLatestTransaction(transactions: Transaction[]): Transaction {
  return transactions.reduce((a, b) => {
    return a.blockNumber > b.blockNumber ? a : b
  })
}

// transaction is assumed to belong to a valid key, one that has not already expired
export function transactionToKeyStatus(
  transaction: Transaction,
  requiredConfirmations: number
): KeyStatus {
  switch (transaction.status) {
    case TransactionStatus.MINED:
      if (transaction.confirmations < requiredConfirmations) {
        return KeyStatus.CONFIRMING
      }
      return KeyStatus.VALID
    default:
      // I don't like punning on the TransactionStatus type here, but
      // fixing it will require a deeper refactor. At this point, only
      // values of TransactionStatus that map to KeyStatus should be
      // possible, but this is brittle.
      return ((transaction.status as unknown) as KeyStatus) || KeyStatus.NONE
  }
}

// Adapted from blockchainHandler/keyStatus.js but without requiring keys to be already linked to transactions
export function getKeyStatus(
  key: KeyResult,
  transactionsForKey: Transaction[],
  requiredConfirmations: number
): KeyStatus {
  let valid = isValidKey(key)

  if (transactionsForKey.length === 0) {
    return valid ? KeyStatus.VALID : KeyStatus.NONE
  }

  // During the transition from "submitted" to "confirming", a key may
  // have an expiration of 0 for a short period. Because of this, keys
  // that have associated transactions but an expiration of 0 are
  // considered valid.
  valid = valid || key.expiration === 0

  if (!valid) {
    return KeyStatus.EXPIRED
  }

  const latestTransaction = getLatestTransaction(transactionsForKey)

  return transactionToKeyStatus(latestTransaction, requiredConfirmations)
}

// Given the status of all members of a set of keys, return the one that takes precedence.
export function getHighestStatus(statuses: KeyStatus[]): KeyStatus {
  let table: { [key in KeyStatus]?: KeyStatus } = {}
  statuses.forEach(status => (table[status] = status))

  return (
    table[KeyStatus.VALID] ||
    table[KeyStatus.CONFIRMING] ||
    table[KeyStatus.PENDING] ||
    table[KeyStatus.SUBMITTED] ||
    table[KeyStatus.EXPIRED] ||
    KeyStatus.NONE
  )
}
