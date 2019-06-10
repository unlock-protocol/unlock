import { getAccount } from './account'
import ensureWalletReady from './ensureWalletReady'
import submittedListener from './purchaseKey/submittedListener'
import { linkTransactionsToKey } from './keyStatus'
import { storeTransaction } from './locksmithTransactions'

/**
 * Purchase a key on a lock for the current user
 *
 * @param {walletService} walletService the walletService instance to use for purchasing the key. It needs to implement EventEmitter, and have purchaseKey
 * @param {string} lockAddress The address of the lock to purchase a key on
 * @param {string|BigNumber} amountToSend the key price and any optional extra funds to send to the lock (allows tipping)
 * @param {string} erc20Address address of the ERC20 contract for that lock, if applicable
 */
export async function purchaseKey({
  walletService,
  lockAddress,
  amountToSend,
  erc20Address,
}) {
  await ensureWalletReady(walletService)
  const account = getAccount()

  // Support the currency!
  return walletService.purchaseKey(
    lockAddress,
    account,
    amountToSend,
    null /* account */, // THIS FIELD HAS BEEN DEPRECATED AND WILL BE IGNORED
    null /* data */, // THIS FIELD HAS BEEN DEPRECATED AND WILL BE IGNORED
    erc20Address
  )
}

/**
 * This function is re-entrant, thus can be called at any stage of the transaction life cycle (on page refresh, for example)
 *
 * @param {walletService} walletService the walletService instance to use for monitoring key purchase initiation. Should implement emitting 'transaction.new', 'transaction.pending', 'error'
 * @param {web3Service} web3Service the web3Service instance to use for monitoring the transaction cycle after transaction hash is available. Should implement emitting 'transaction.updated', 'error'
 * @param {object} startingTransactions transactions, indexed by transaction hash that were initiated by the current user
 * @param {object} startingKey the current key object
 * @param {string} lockAddress the address of the lock on which we are purchasing a key
 * @param {number} requiredConfirmations the number of confirmations needed to consider a key purchase mined
 * @param {function} update a callback which accepts update(latestTransactions, latestKey)
 * @param {function} walletAction a callback called when 'transaction.pending' is emitted, to inform the frontend to show a modal
 */
export async function processKeyPurchaseTransactions({
  walletService,
  web3Service,
  startingTransactions,
  startingKey,
  lockAddress,
  requiredConfirmations,
  update,
  walletAction,
  window,
  locksmithHost,
}) {
  const transactions = startingTransactions
  let result
  walletService.addListener('transaction.pending', walletAction)
  try {
    result = await submittedListener({
      lockAddress,
      existingTransactions: transactions,
      existingKey: startingKey,
      walletService,
      web3Service,
      requiredConfirmations,
    })
    if (result) {
      const transaction = result.transaction
      const key = result.key
      update({ transaction, key })
      storeTransaction({ window, transaction, locksmithHost, walletService })
      // start the polling
      web3Service.getTransaction(result.transaction.hash)
    } else {
      const linkedKey = linkTransactionsToKey({
        key: startingKey,
        transactions,
        requiredConfirmations,
      })
      if (linkedKey.transactions[0]) {
        // start the polling
        web3Service.getTransaction(linkedKey.transactions[0].hash)
      }
    }
  } finally {
    walletService.removeListener('transaction.pending', walletAction)
  }
}
