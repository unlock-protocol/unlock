import { linkTransactionsToKey } from '../keyStatus'
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
 * @param {web3Service} web3Service used to retrieve the latest key expiration timestamp
 * @param {int} requiredConfirmations the number of required confirmations for a transaction to be considered permanent
 */
export default async function submittedListener({
  existingTransactions,
  existingKey,
  walletService,
  web3Service,
  requiredConfirmations,
}) {
  // update key status for expired keys
  const linkedKey = linkTransactionsToKey({
    key: existingKey,
    transactions: existingTransactions,
    requiredConfirmations,
  })
  const network = getNetwork()
  // key.status is one of:
  // none, submitted, pending, confirming, valid, expired, failed
  // we can only initiate a new purchase if the current key is not valid, and is
  // not being purchased. These 3 statuses are the
  if (
    linkedKey.status !== 'none' &&
    linkedKey.status !== 'expired' &&
    linkedKey.status !== 'failed'
  ) {
    return false
  }

  // wait for the submitted transaction to become pending
  let done
  let kill
  const pendingTransactionFinished = new Promise((resolve, reject) => {
    done = resolve
    kill = reject
  })

  walletService.once(
    'transaction.new',
    (hash, from, to, input, type, status) => {
      done({ hash, from, to, input, type, status })
    }
  )
  walletService.on('error', kill)

  let newTransaction
  try {
    newTransaction = await pendingTransactionFinished
  } finally {
    walletService.off('error', kill)
  }
  const transaction = {
    ...newTransaction,
    key: `${newTransaction.to}-${newTransaction.from}`,
    lock: newTransaction.to,
    confirmations: 0,
    network,
    blockNumber: Number.MAX_SAFE_INTEGER, // ensure this is always the current transaction until it is mined
  }

  return {
    transaction,
    key: await web3Service.getKeyByLockForOwner(
      existingKey.lock,
      existingKey.owner
    ),
  }
}
