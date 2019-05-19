import { getAccount } from './account'

export function validKey(key) {
  return key.expiration > new Date().getTime() / 1000
}

export function getKeyStatus(key, requiredConfirmations) {
  if (!key.transactions || !key.transactions.length) {
    return validKey(key) ? 'valid' : 'none'
  }
  const lastTransaction = key.transactions[0]
  switch (lastTransaction.status) {
    case 'mined':
      if (lastTransaction.confirmations < requiredConfirmations) {
        return 'confirming'
      }
      if (key.expiration < new Date().getTime() / 1000) {
        return 'expired'
      }
      return 'valid'
    default:
      return lastTransaction.status || 'none'
  }
}

export function linkTransactionsToKeys({
  keys,
  transactions,
  locks,
  requiredConfirmations,
}) {
  const account = getAccount()
  const newKeys = {}

  const transactionsByLock = locks.reduce((indexedTransactions, lock) => {
    // get the key purchase transactions sorted in reverse chronological order
    const keyPurchaseTransactions = Object.values(transactions)
      .filter(transaction => {
        return transaction.from === account && transaction.to === lock
      })
      .sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))

    indexedTransactions[lock] = keyPurchaseTransactions
    return indexedTransactions
  }, {})

  Object.values(keys).forEach(key => {
    const fullKey = {
      ...key,
      status: getKeyStatus(key, requiredConfirmations),
    }
    if (!transactionsByLock[key.lock]) {
      newKeys[key.id] = fullKey
      return
    }
    fullKey.confirmations = transactionsByLock[key.lock][0].confirmations
    fullKey.transactions = transactionsByLock[key.lock]
    fullKey.status = getKeyStatus(fullKey, requiredConfirmations)
    newKeys[fullKey.id] = fullKey
  })

  return newKeys
}
