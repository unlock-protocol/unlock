import { getAccount } from './account'
import ensureWalletReady from './ensureWalletReady'
import submittedListener from './purchaseKey/submittedListener'
import updateListener from './purchaseKey/updateListener'

export async function purchaseKey({
  walletService,
  window,
  lockAddress,
  amountToSend,
}) {
  await ensureWalletReady(window)
  const account = getAccount()

  return walletService.purchaseKey(lockAddress, account, amountToSend)
}

export async function processKeyPurchaseTransactions({
  walletService,
  web3Service,
  startingTransactions,
  startingKeys,
  lockAddress,
  requiredConfirmations,
  update,
  walletAction,
}) {
  let transactions = startingTransactions
  let keys = startingKeys
  let result
  const account = getAccount()
  let error
  const setError = e => (error = e)
  walletService.addListener('error', setError)
  walletService.addListener('transaction.pending', walletAction)
  const afterEventProcessed = () => {
    if (error) {
      walletService.removeListener('error', setError)
      walletService.removeListener('transaction.pending', walletAction)
      throw error
    }
    if (transactions !== result.transactions) {
      transactions = result.transactions
      keys = result.keys
      update(transactions, keys)
    }
  }

  result = await submittedListener({
    lockAddress,
    existingTransactions: transactions,
    existingKeys: keys,
    walletService,
    requiredConfirmations,
  })
  afterEventProcessed()

  walletService.removeListener('error', setError)
  web3Service.once('error', e => (error = e))

  let key
  const keyId = `${lockAddress}-${account}`
  do {
    result = await updateListener({
      lockAddress,
      existingTransactions: transactions,
      existingKeys: keys,
      web3Service,
      requiredConfirmations,
    })
    afterEventProcessed()
    key = keys[keyId]
  } while (key.status === 'confirming')
  web3Service.removeListener('error', setError)
  walletService.removeListener('transaction.pending', walletAction)
}
