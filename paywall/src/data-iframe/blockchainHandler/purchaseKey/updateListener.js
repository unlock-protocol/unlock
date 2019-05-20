import { getAccount } from '../account'
import { linkTransactionsToKeys } from '../keyStatus'

export default async function updateListener({
  lockAddress,
  existingTransactions,
  existingKeys,
  web3Service,
  requiredConfirmations,
}) {
  const account = getAccount()
  const keyToPurchase = `${lockAddress}-${account}`
  // expire any keys that are expired
  const keys = linkTransactionsToKeys({
    keys: existingKeys,
    transactions: existingTransactions,
    locks: [lockAddress],
    requiredConfirmations,
  })
  const key = keys[keyToPurchase]
  const transaction = key.transactions[0]
  if (
    !['submitted', 'pending', 'mined'].includes(transaction.status) ||
    (transaction.status === 'mined' &&
      transaction.confirmations > requiredConfirmations)
  ) {
    return {
      transactions: existingTransactions,
      keys: existingKeys,
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
    keys: linkTransactionsToKeys({
      keys: existingKeys,
      transactions,
      locks: [lockAddress],
      requiredConfirmations,
    }),
  }
}
