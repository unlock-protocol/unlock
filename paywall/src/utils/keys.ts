import {
  KeyStatus,
  KeyResult,
  Transactions,
  TransactionStatus,
} from '../unlockTypes'
import { isValidKey } from '../data-iframe/blockchainHandler/keyStatus'

// Adapted from blockchainHandler/keyStatus.js but without requiring keys to be already linked to transactions
export function getKeyStatus(
  key: KeyResult,
  transactions: Transactions,
  requiredConfirmations: number
): KeyStatus {
  let valid = isValidKey(key)

  // The object structure of the transactions doesn't help us here,
  // just use an array
  const rawTransactions = Object.values(transactions)
  const transactionsForKey = rawTransactions.filter(tx => tx.lock === key.lock)

  if (transactionsForKey.length === 0) {
    return valid ? KeyStatus.VALID : KeyStatus.NONE
  }

  // During the transition from "submitted" to "confirming", a key may
  // have an expiration of 0 for a short period. Now that we know we
  // have at least one transaction related to this key, we establish a
  // special case that keys with 0 expiration count as valid (since
  // they would have a higher expiration if they were actually
  // expired)
  valid = valid || key.expiration === 0

  const latestTransaction = transactionsForKey.reduce((a, b) => {
    if (a.blockNumber > b.blockNumber) {
      return a
    }
    return b
  })

  switch (latestTransaction.status) {
    case TransactionStatus.MINED:
      // It's possible for a key to expire before it has all the required confirmations
      if (latestTransaction.confirmations < requiredConfirmations) {
        return valid ? KeyStatus.CONFIRMING : KeyStatus.EXPIRED
      }
      // But this is the more likely case
      return valid ? KeyStatus.VALID : KeyStatus.EXPIRED
    default:
      // I don't like punning on the TransactionStatus type here, but
      // fixing it will require a deeper refactor. At this point, only
      // values of TransactionStatus that map to KeyStatus should be
      // possible, but this is brittle.
      return (
        ((latestTransaction.status as unknown) as KeyStatus) || KeyStatus.NONE
      )
  }
}

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

// e.g. keyHasStatus(key, KeyStatus.VALID, KeyStatus.CONFIRMING)
// returns true if the key.status field is VALID or CONFIRMING
export function keyHasStatus(
  key: { status: KeyStatus },
  ...statuses: KeyStatus[]
) {
  return statuses.some(expectedStatus => key.status === expectedStatus)
}

// e.g. anyKeyHasStatus(keys, KeyStatus.VALID, KeyStatus.CONFIRMING)
// returns true if any of the keys has a status field that is VALID or
// CONFIRMING
export function anyKeyHasStatus(
  keys: { status: KeyStatus }[],
  ...statuses: KeyStatus[]
) {
  return keys.some(key => keyHasStatus(key, ...statuses))
}
