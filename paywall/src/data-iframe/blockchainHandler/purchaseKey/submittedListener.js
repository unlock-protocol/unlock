import { getAccount } from '../account'
import { linkTransactionsToKeys } from '../keyStatus'
import { getNetwork } from '../network'

/**
 * Listen for a submitted key purchase transaction
 *
 * If the latest transaction for a key is already submitted or newer, we immediately return
 * in order to allow declarative chaining of transaction listeners.
 *
 * This allows us to call the transaction listener sequence for all transactions, including when
 * the user refreshes the page in the middle of a transaction sequence. In this case, the
 * submitted listener will skip its work and pass to the next one in the sequence
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
  // key.status is one of:
  // none, submitted, pending, confirming, valid, expired, failed
  // we can only initiate a new purchase if the current key is not valid, and is
  // not being purchased. These 3 statuses are the
  if (
    key.status !== 'none' &&
    key.status !== 'expired' &&
    key.status !== 'failed'
  ) {
    return {
      transactions: existingTransactions,
      keys: existingKeys,
    }
  }

  // wait for the submitted transaction to become pending
  let done
  const pendingTransactionFinished = new Promise(resolve => (done = resolve))

  walletService.once(
    'transaction.new',
    (hash, from, to, input, type, status) => {
      done({ hash, from, to, input, type, status })
    }
  )

  const newTransaction = await pendingTransactionFinished
  const transaction = {
    ...newTransaction,
    key: keyToPurchase,
    lock: newTransaction.to,
    confirmations: 0,
    network,
    blockNumber: Number.MAX_SAFE_INTEGER, // ensure this is always the current transaction until it is mined
  }

  const transactions = {
    ...existingTransactions,
    [transaction.hash]: transaction,
  }
  return {
    transactions,
    keys: linkTransactionsToKeys({
      keys: existingKeys,
      transactions,
      locks: [lockAddress],
      requiredConfirmations,
    }),
  }
}
