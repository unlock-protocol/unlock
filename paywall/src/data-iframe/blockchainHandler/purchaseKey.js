import shallowEqual from 'shallow-equal/objects'
import { getNetwork } from './network'
import { getAccount } from './account'
import ensureWalletReady from './ensureWalletReady'
import { TRANSACTION_TYPES } from '../../constants'
import pollForChanges from './pollForChanges'

export async function purchaseKey(walletService, window, lock, amountToSend) {
  await ensureWalletReady(window)
  const account = getAccount()

  return walletService.purchaseKey(lock, account, amountToSend)
}

/**
 * Listens for the next time an event occurs, and resolves. If an error occurs first, it rejects
 *
 * @param {*} service either web3Service or walletService
 * @param {string} event event to listen for
 */
function resolveOnEvent(service, event) {
  let resolved = false
  return new Promise((resolve, reject) => {
    service.once('error', e => {
      if (resolved) return
      reject(e)
    })
    service.once(event, (...args) => resolve(args))
  })
}

/**
 * Listen for the transaction.pending and transaction.new events
 *
 * It calls `onTransactionUpdate` whenever one of these events is emitted
 *
 * It returns the updated list of all transactions, keys, and the current transaction status
 */
export async function processKeyPurchaseTransaction({
  walletService,
  lock,
  existingTransactions,
  existingKeys,
  onTransactionUpdate,
}) {
  const account = getAccount()
  const transactions = {
    ...existingTransactions,
  }
  const keyToPurchase = `${lock}-${account}`
  const keys = {
    ...existingKeys,
    [keyToPurchase]: {
      id: keyToPurchase,
      lock,
      owner: account,
      expiration: 0,
      transactions: {},
      status: 'pending',
    },
  }
  const network = getNetwork()

  let transactionType
  do {
    // get the 2nd argument to the handler for transaction.pending
    ;[, transactionType] = await resolveOnEvent(
      walletService,
      'transaction.pending'
    )
  } while (transactionType !== TRANSACTION_TYPES.KEY_PURCHASE)
  let transaction = {
    status: 'pending',
    type: transactionType,
    lock,
    key: keyToPurchase,
    confirmations: 0,
  }
  keys[keyToPurchase].transactions.pending = transaction
  onTransactionUpdate(transactions, keys, 'pending')
  const [hash, from, to, input, type, status] = await resolveOnEvent(
    walletService,
    'transaction.new'
  )
  transaction = {
    hash,
    ...transaction,
    confirmations: 0,
    from,
    to,
    input,
    type,
    status,
    network,
  }
  transactions[hash] = transaction
  delete keys[keyToPurchase].transactions.pending
  keys[keyToPurchase].status = status
  keys[keyToPurchase].transactions = keys[keyToPurchase].transactions || {}
  keys[keyToPurchase].transactions[hash] = transaction
  onTransactionUpdate(transactions, keys, status)
  return { transactions, keys, status }
}

/**
 * At this point, the transaction has been mined at least once.
 *
 * This function polls for transaction updates (transaction.updated event) and emits
 * changes in `onTransactionUpdate`. When the required minimum number of confirmations are met
 * it stops polling and returns the current transactions and keys
 */
export async function pollForKeyPurchaseTransaction({
  web3Service,
  hash,
  existingTransactions,
  existingKeys,
  requiredConfirmations,
  lock,
  onTransactionUpdate,
}) {
  const transactions = {
    ...existingTransactions,
  }
  const keys = {
    ...existingKeys,
  }
  const account = getAccount()
  const keyToPurchase = `${lock}-${account}`
  let transaction = {
    ...existingTransactions[hash],
  }
  web3Service.getTransaction(hash)

  await pollForChanges(
    async () => {
      const [, update] = await resolveOnEvent(
        web3Service,
        'transaction.updated'
      )
      return {
        ...transaction,
        ...update,
      }
    } /* getCurrentValue */,
    (oldTransaction, newTransaction) => {
      return !shallowEqual(oldTransaction, newTransaction)
    } /* hasValueChanged */,
    newTransaction => {
      if (newTransaction.confirmations < requiredConfirmations) return true
    } /* continuePolling */,
    newTransaction => {
      transactions[hash] = newTransaction
      keys[keyToPurchase].transactions[hash] = newTransaction
      keys[keyToPurchase].status = newTransaction.status
      onTransactionUpdate(transactions, keys, newTransaction.status)
    } /* changeListener */,
    0 /* delay */
  )
  return { transactions, keys }
}
