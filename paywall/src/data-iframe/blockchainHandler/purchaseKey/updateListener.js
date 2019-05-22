import { linkTransactionsToKey } from '../keyStatus'

export default async function updateListener({
  existingTransactions,
  existingKey,
  web3Service,
  requiredConfirmations,
}) {
  // expire any keys that are expired
  const key = linkTransactionsToKey({
    key: existingKey,
    transactions: existingTransactions,
    requiredConfirmations,
  })
  const transaction = key.transactions[0]
  if (
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
  const transactionUpdateReceived = new Promise(resolve => (done = resolve))

  function handleTransactionUpdate(hash, update) {
    if (hash !== transaction.hash) {
      // only respond to our transaction
      return web3Service.once('transaction.updated', handleTransactionUpdate)
    }
    done(update)
  }

  web3Service.once('transaction.updated', handleTransactionUpdate)
  const update = await transactionUpdateReceived
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
    key: linkTransactionsToKey({
      key: existingKey,
      transactions,
      requiredConfirmations,
    }),
  }
}
