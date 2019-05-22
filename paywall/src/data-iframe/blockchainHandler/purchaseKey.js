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
  startingKey,
  lockAddress,
  requiredConfirmations,
  update,
  walletAction,
}) {
  let transactions = startingTransactions
  let key = startingKey
  let result
  walletService.addListener('transaction.pending', walletAction)
  const afterEventProcessed = () => {
    if (transactions !== result.transactions) {
      transactions = result.transactions
      key = result.key
      update(transactions, key)
    }
  }

  result = await submittedListener({
    lockAddress,
    existingTransactions: transactions,
    existingKey: key,
    walletService,
    requiredConfirmations,
  })
  afterEventProcessed()

  do {
    result = await updateListener({
      lockAddress,
      existingTransactions: transactions,
      existingKey: key,
      web3Service,
      requiredConfirmations,
    })
    afterEventProcessed()
  } while (key.status === 'confirming')
  walletService.removeListener('transaction.pending', walletAction)
}
