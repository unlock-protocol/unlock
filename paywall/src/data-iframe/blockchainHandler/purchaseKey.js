import { getNetwork } from './network'
import { getAccount } from './account'
import ensureWalletReady from './ensureWalletReady'

export async function purchaseKey(walletService, window, lock) {
  await ensureWalletReady(window)
  const account = getAccount()

  const keyToPurchase = `${lock}-${account}`

  await walletService.purchaseKey(keyToPurchase)
}

export async function processKeyPurchaseTransaction({
  web3Service,
  walletService,
  lock,
  requiredConfirmations,
  existingTransactions,
  existingKeys,
}) {
  const account = getAccount()
  const transactions = {
    ...existingTransactions,
  }
  const keys = {
    ...existingKeys,
  }
  const keyToPurchase = `${lock}-${account}`
  const network = getNetwork()

  return {
    walletService,
    network,
    lock,
    keyToPurchase,
    transactions,
    keys,
    requiredConfirmations,
    web3Service,
  }
}

export function getKeyPurchaseTransactionMonitor({
  walletService,
  network,
  lock,
  keyToPurchase,
  transactions,
  keys,
  requiredConfirmations,
  web3Service,
}) {
  return new Promise((resolve, reject) => {
    walletService.once('error', e => reject(e))
    walletService.once('transaction.pending', () => {
      resolve(
        new Promise((resolve, reject) => {
          walletService.once('error', e => reject(e))
          walletService.once(
            'transaction.new',
            (hash, from, to, input, type, status) => {
              const transaction = {
                hash,
                from,
                to,
                input,
                type,
                status,
                network,
                lock,
                key: keyToPurchase,
              }
              transactions[hash] = transaction
              keys[keyToPurchase].transactions[hash] = transaction

              const nextConfirmation = handleTransactionUpdate({
                hash,
                update: { confirmations: 0 },
                transactions,
                keyToPurchase,
                requiredConfirmations,
                web3Service,
                keys,
              })
              resolve({
                transaction,
                nextConfirmation,
              })
            }
          )
        })
      )
    })
  })
}

export function handleTransactionUpdate({
  hash,
  update,
  transactions,
  keyToPurchase,
  requiredConfirmations,
  web3Service,
  keys,
}) {
  transactions[hash] = {
    ...transactions[hash],
    ...update,
  }
  keys[keyToPurchase].transactions = keys[keyToPurchase].transactions || {}
  keys[keyToPurchase].transactions[hash] = transactions[hash]
  if (update.confirmations < requiredConfirmations) {
    return new Promise((resolve, reject) => {
      web3Service.once('error', e => reject(e))
      web3Service.once('transaction.updated', (hash, newUpdate) => {
        resolve({
          nextConfirmation: () => {
            return handleTransactionUpdate({
              transaction: transactions[hash],
              hash,
              update: newUpdate,
              transactions,
              keyToPurchase,
              requiredConfirmations,
              web3Service,
              keys,
            })
          },
          transactions,
          keys,
        })
      })
    })
  }
  return Promise.resolve({ nextConfirmation: false, transactions, keys })
}
