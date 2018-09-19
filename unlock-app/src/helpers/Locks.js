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
