import { getAccount } from './account'
import ensureWalletReady from './ensureWalletReady'
import submittedListener from './purchaseKey/submittedListener'
import updateListener from './purchaseKey/updateListener'
import { linkTransactionsToKey } from './keyStatus'

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
 * This function is re-entrant, thus can be called at any stage of the transaction life cycle (on page refresh, for example)
 *
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
  let linkedKey
  let result
  walletService.addListener('transaction.pending', walletAction)
  try {
    const afterEventProcessed = () => {
      if (result) {
        const transaction = result.transaction
        transactions = {
          ...transactions,
          [transaction.hash]: transaction,
        }
        key = result.key
        update({ transaction, key })
      }
    }

    result = await submittedListener({
      lockAddress,
      existingTransactions: transactions,
      existingKey: key,
      walletService,
      web3Service,
      requiredConfirmations,
    })
    afterEventProcessed()

    if (!result) {
      // no change to the existing transaction/key
      if (['submitted', 'pending', 'confirming'].includes(key.status)) {
        web3Service.getTransaction(key.transactions[0]) // start the polling
      }
    } else {
      web3Service.getTransaction(result.transaction.hash) // start the polling
    }
    do {
      result = await updateListener({
        lockAddress,
        existingTransactions: transactions,
        existingKey: key,
        web3Service,
        requiredConfirmations,
      })
      afterEventProcessed()
      linkedKey = linkTransactionsToKey({
        key,
        transactions,
        requiredConfirmations,
      })
    } while (
      result &&
      linkedKey.status !== 'valid' &&
      linkedKey.status !== 'failed'
    )
  } finally {
    walletService.removeListener('transaction.pending', walletAction)
  }
}
