import { getNetwork } from './network'
import { getAccount } from './account'
import ensureWalletReady from './ensureWalletReady'
import { TRANSACTION_TYPES } from '../../constants'
import pollForChanges from './pollForChanges'

export async function purchaseKey(walletService, window, lock) {
  await ensureWalletReady(window)
  const account = getAccount()

  const keyToPurchase = `${lock}-${account}`

  await walletService.purchaseKey(keyToPurchase)
}

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

function sortOfEqual(a, b) {
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  if (aKeys.length !== bKeys.length) return false
  if (aKeys.filter((key, index) => bKeys[index] !== key).length) return false
  if (aKeys.filter(key => a[key] !== b[key]).length) return false
  return true
}

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
  keys[keyToPurchase].transactions = keys[keyToPurchase].transactions || {}
  keys[keyToPurchase].transactions[hash] = transaction
  onTransactionUpdate(transactions, keys, status)
  return { transactions, keys, status }
}

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
      return !sortOfEqual(oldTransaction, newTransaction)
    } /* hasValueChanged */,
    newTransaction => {
      if (newTransaction.confirmations < requiredConfirmations) return true
    } /* continuePolling */,
    newTransaction => {
      transactions[hash] = newTransaction
      keys[keyToPurchase].transactions[hash] = newTransaction
      onTransactionUpdate(transactions, keys, newTransaction.status)
    } /* changeListener */,
    0 /* delay */
  )
  return { transactions, keys }
}
