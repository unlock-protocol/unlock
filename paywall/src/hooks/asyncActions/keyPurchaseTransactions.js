export function makeGetTransactionInfo({
  web3,
  transactionHash,
  startTransaction,
  mineTransaction,
  failTransaction,
}) {
  const getTransactionInfo = async transaction => {
    if (!transactionHash) return
    const [blockNumber, blockTransaction] = await Promise.all([
      web3.eth.getBlockNumber(),
      web3.eth.getTransaction(transactionHash),
    ])

    // If the block transaction is missing the transaction has been submitted but not
    // received by all nodes
    if (!blockTransaction) {
      return
    }

    // If the block number is missing the transaction has been received by the node
    // but not mined yet
    // This means the transaction is not in a block yet (ie. not mined), but has been propagated
    // We do not know what the transaction is about though so we need to extract its info from
    // the input.
    if (blockTransaction.blockNumber === null) return
    if (transaction.asOf !== blockTransaction.blockNumber) {
      startTransaction(
        blockTransaction.to,
        blockTransaction.input,
        blockTransaction.blockNumber
      )
      return
    }
    // The transaction has been mined :
    mineTransaction(blockNumber)

    // The transaction was mined, so we should have a receipt for it
    const transactionReceipt = await web3.eth.getTransactionReceipt(
      transactionHash
    )
    if (transactionReceipt) {
      // NOTE: old version of web3.js (pre 1.0.0-beta.34) are not parsing 0x0 into a falsy value
      if (!transactionReceipt.status || transactionReceipt.status === '0x0') {
        failTransaction()
      }
    }
  }
  return getTransactionInfo
}

export function makeTransactionPoll({
  transaction,
  requiredConfirmations,
  getTransactionInfo,
}) {
  const transactionPoll = async () => {
    if (!['pending', 'confirming', 'mined'].includes(transaction.status)) return
    if (transaction.confirmations >= requiredConfirmations) return
    getTransactionInfo(transaction)
  }
  return transactionPoll
}

export function sendNewKeyPurchaseTransaction({
  to,
  from,
  data,
  value,
  gas,
  wallet,
  newTransaction,
  setHash,
  setError,
}) {
  const transaction = wallet.eth.sendTransaction({
    to,
    from,
    value,
    data,
    gas,
  })
  newTransaction()

  transaction
    .once('transactionHash', hash => {
      setHash(hash)
    })
    .on('error', error => setError(error))
}
