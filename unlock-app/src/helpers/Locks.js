import configure from '../config'

const config = configure(global)

/**
 * Given the address of a lock, returns its accompanying transaction
 * @param transactionStore
 * @param lockAddress
 * @returns {object}
 */
export function getLockTransaction(transactionStore, lockAddress) {
  if (transactionStore && transactionStore.all) {
    for (let transaction in transactionStore.all) {
      let transactionObject = transactionStore.all[transaction]
      if (transactionObject.lock && transactionObject.lock.address === lockAddress)
        return transactionObject
    }
  }
  return null
}

/**
 * Given the address of a lock, returns the number of confirmations it has received
 * @param transactionStore
 * @param lockAddress
 * @returns {number}
 */
export function getLockConfirmations(transactionStore, lockAddress) {
  let transaction = getLockTransaction(transactionStore, lockAddress)
  if (transaction) return transaction.confirmations
  return null
}

/**
 * Returns a status string for a given lock, used to determine which component to display
 * @param transactionStore
 * @param lockAddress
 * @returns {string}
 */
export function getLockStatusString(transactionStore, lockAddress) {
  let transaction = getLockTransaction(transactionStore, lockAddress)
  if (!transaction) return 'notfound'
  if (transaction.status === 'mined' && transaction.confirmations >= config.requiredConfirmations) return 'deployed'
  if (transaction.status === 'mined' && transaction.confirmations < config.requiredConfirmations) return 'confirming'
  if (transaction.status !== 'mined') return 'pending'
}
