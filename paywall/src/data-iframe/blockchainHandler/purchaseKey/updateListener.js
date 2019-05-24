import { linkTransactionsToKey } from '../keyStatus'

export default async function updateListener({
  existingTransactions,
  existingKey,
  web3Service,
  requiredConfirmations,
}) {
  const linkedKey = linkTransactionsToKey({
    key: existingKey,
    transactions: existingTransactions,
    requiredConfirmations,
  })
  const transaction = linkedKey.transactions[0]
  if (
    !transaction ||
    !['submitted', 'pending', 'mined'].includes(transaction.status) ||
    (transaction.status === 'mined' &&
      transaction.confirmations > requiredConfirmations)
  ) {
    return {
      transactions: existingTransactions,
      key: existingKey,
    }
  }

  // get one transaction update
  let done
  let kill
  const transactionUpdateReceived = new Promise((resolve, reject) => {
    done = resolve
    kill = reject
  })

  function handleTransactionUpdate(hash, update) {
    if (hash !== transaction.hash) {
      // only respond to our transaction
      return web3Service.once('transaction.updated', handleTransactionUpdate)
    }
    done(update)
  }

  web3Service.on('error', kill)
  web3Service.once('transaction.updated', handleTransactionUpdate)
  let update
  try {
    update = await transactionUpdateReceived
  } finally {
    web3Service.off('error', kill)
  }
  const newTransaction = {
    ...transaction,
    ...update,
  }
  const transactions = {
    ...existingTransactions,
    [newTransaction.hash]: newTransaction,
  }
  return {
    transactions,
    // this ensures we always have the latest expiration info
    key: await web3Service.getKeyByLockForOwner(
      existingKey.lock,
      existingKey.owner
    ),
  }
}
