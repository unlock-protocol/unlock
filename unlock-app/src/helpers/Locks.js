import configure from '../config'

const config = configure(global)

/**
 * Given the address of a lock, returns its accompanying transaction
 * @param transactionStore
 * @param lockId
 * @returns {object}
 */
export function getLockTransaction(transactionStore, lockId) {
  if (transactionStore && transactionStore.all) {
    for (let transaction in transactionStore.all) {
      let transactionObject = transactionStore.all[transaction]
      if (transactionObject.lock === lockId)
        return transactionObject
    }
  }
  return null
}

/**
 * Given the address of a lock, returns the number of confirmations it has received
 * @param transactionStore
 * @param lockId
 * @returns {number}
 */
export function getLockConfirmations(transactionStore, lockId) {
  let transaction = getLockTransaction(transactionStore, lockId)
  if (transaction) return transaction.confirmations
  return null
}

/**
 * Returns a status string for a given lock, used to determine which component to display
 * @param transactionStore
 * @param lockId
 * @returns {string}
 */
export function getLockStatusString(transactionStore, lockId) {
  let transaction = getLockTransaction(transactionStore, lockId)
  if (!transaction) return 'notfound'
  if (transaction.status === 'submitted') return 'submitted'
  if (transaction.status === 'mined' && transaction.confirmations >= config.requiredConfirmations) return 'deployed'
  if (transaction.status === 'mined' && transaction.confirmations < config.requiredConfirmations) return 'confirming'
  return 'unknown'
}
