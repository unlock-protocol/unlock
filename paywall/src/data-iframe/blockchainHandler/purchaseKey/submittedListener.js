import { linkTransactionsToKeys } from '../keyStatus'
import { TRANSACTION_TYPES } from '../../../constants'
import { getAccount } from '../account'
import { getNetwork } from '../network'

/**
 * Listen for a submitted key purchase transaction
 *
 * If the latest transaction for a key is already pending or newer, we immediately return
 * in order to allow declarative chaining of transaction listeners.
 *
 * This allows us to call the transaction listener chain for all transactions, including when
 * the user refreshes the page in the middle of a transaction chain. In this case, the
 * submitted listener will skip its work and pass to the next one in the chain
 *
 * @param {string} lockAddress the address of the lock we are listening for a submitted key purchase transaction
 * @param {object} existingTransactions transactions, indexed by hash
 * @param {object} existingKeys keys, indexed by "lock address-owner address"
 * @param {walletService} walletService the walletService that initiated the key transaction
 * @param {int} requiredConfirmations the number of required confirmations for a transaction to be considered permanent
 */
export default async function submittedListener({
  lockAddress,
  existingTransactions,
  existingKeys,
  walletService,
  requiredConfirmations,
}) {
  // update key status for expired keys
  const keys = linkTransactionsToKeys({
    keys: existingKeys,
    transactions: existingTransactions,
    locks: [lockAddress],
    requiredConfirmations,
  })
  const account = getAccount()
  const network = getNetwork()
  const keyToPurchase = `${lockAddress}-${account}`
  const key = keys[keyToPurchase]
  if (
    (key.status !== 'expired' && key.status !== 'none') ||
    key.status === 'failed'
  ) {
    return {
      transactions: existingTransactions,
      keys: existingKeys,
    }
  }

  // we are initiating a key purchase
  let done
  const pendingTransactionFinished = new Promise(resolve => (done = resolve))

  function waitForKeyPurchase(type) {
    // ensure we don't match an errant transaction (this is highly unlikely and is just a sanity check)
    if (type !== TRANSACTION_TYPES.KEY_PURCHASE) {
      return walletService.once('transaction.pending', waitForKeyPurchase)
    }
    done(type)
  }
  walletService.once('transaction.pending', waitForKeyPurchase)
  const transactionType = await pendingTransactionFinished // wait for walletService to emit transaction.pending

  // default values
  const submittedTransaction = {
    hash: null,
    from: account,
    to: lockAddress,
    status: 'submitted',
    type: transactionType,
    key: keyToPurchase,
    lock: lockAddress,
    confirmations: 0,
    network,
    blockNumber: Number.MAX_SAFE_INTEGER,
  }
  const transactions = {
    ...existingTransactions,
    // we have no transaction hash yet, so we will use "submitted" with the lock and owner to namespace this transaction
    [`submitted-${lockAddress}-${account}`]: submittedTransaction,
  }

  return {
    transactions,
    // update the keys to include the new submitted transaction
    keys: linkTransactionsToKeys({
      keys: existingKeys,
      transactions,
      locks: [lockAddress],
      requiredConfirmations,
    }),
  }
}
