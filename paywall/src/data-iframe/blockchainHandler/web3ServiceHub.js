import { getTransactions, getAccount } from '../cacheHandler'

/**
 * Listen for transaction updates, update the transaction and key that it affects
 * if the transaction is for a key purchase.
 *
 * Also listen for errors, and feed all changes back to the cache via onChange
 *
 * @param {web3Service} web3Service the web3Service object we will listen for events on
 * @param {Function} onChange the blockchain onChange callback
 * @param {window} window the current global context
 */
export default async function web3ServiceHub({
  web3Service,
  onChange,
  window,
}) {
  web3Service.on('transaction.updated', async (hash, update) => {
    const account = await getAccount(window)
    const transactions = await getTransactions(window)
    // we need to build on the previous transaction because 'transaction.updated'
    // never returns the full transaction, we will rely upon the cache
    const oldTransaction = transactions[hash] || {
      hash,
      blockNumber: Number.MAX_SAFE_INTEGER,
    }
    const transaction = {
      ...oldTransaction,
      ...update,
    }
    // report the changed transaction to syncToCache
    onChange({
      transaction,
    })
    if (transaction.key) {
      // ensure that if the key expiration has changed, that we report it to syncToCache
      const key = await web3Service.getKeyByLockForOwner(
        transaction.lock,
        account
      )
      onChange({
        key,
      })
    }
  })
  web3Service.on('error', error => {
    // report all errors to the main window
    onChange({ error })
  })
}
