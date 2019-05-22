import { getAccount } from './account'
import ensureWalletReady from './ensureWalletReady'
import submittedListener from './purchaseKey/submittedListener'
import updateListener from './purchaseKey/updateListener'

/**
 * Purchase a key on a lock for the current user
 *
 * @param {walletService} walletService the walletService instance to use for purchasing the key
 *                                      It needs to implement EventEmitter, and have purchaseKey
 * @param {string} lockAddress The address of the lock to purchase a key on
 * @param {string|BigNumber} amountToSend the key price and any optional extra funds to send to the lock
 *                                        (allows tipping)
 */
export async function purchaseKey({
  walletService,
  lockAddress,
  amountToSend,
}) {
  await ensureWalletReady(walletService)
  const account = getAccount()

  return walletService.purchaseKey(lockAddress, account, amountToSend)
}

/**
 * @param {walletService} walletService the walletService instance to use for monitoring key purchase initiation.
 *                                      Should implement emitting 'transaction.new', 'transaction.pending', 'error'
 * @param {web3Service} web3Service the web3Service instance to use for monitoring the transaction cycle after transaction
 *                                  hash is available. Should implement emitting 'transaction.updated', 'error'
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
