import Web3Utils from 'web3-utils'
import * as UnlockV0 from 'unlock-abi-0'

/**
 * This refreshes a transaction by its hash.
 * It will only process the transaction if the filter function returns true
 * @param {string} transactionHash
 * @param {object} filter
 */
export default function(transactionHash, defaults) {
  return Promise.all([
    this.web3.eth.getBlockNumber(),
    this.web3.eth.getTransaction(transactionHash),
  ]).then(([blockNumber, blockTransaction]) => {
    // If the block transaction is missing the transacion has been submitted but not
    // received by all nodes
    if (!blockTransaction) {
      return this._getSubmittedTransaction(
        transactionHash,
        blockNumber,
        defaults
      )
    }

    // If the block number is missing the transaction has been received by the node
    // but not mined yet
    if (blockTransaction.blockNumber === null) {
      return this._getPendingTransaction(blockTransaction)
    }

    // The transaction has been mined :

    const contract =
      this.unlockContractAddress ===
      Web3Utils.toChecksumAddress(blockTransaction.to)
        ? UnlockV0.Unlock
        : UnlockV0.PublicLock

    const transactionType = this.getTransactionType(
      contract,
      blockTransaction.input
    )

    // Let's watch for more confirmations if needed
    if (
      blockNumber - blockTransaction.blockNumber <
      this.requiredConfirmations
    ) {
      this._watchTransaction(transactionHash)
    }

    // The transaction was mined, so we should have a receipt for it
    this.emit('transaction.updated', transactionHash, {
      status: 'mined',
      type: transactionType,
      confirmations: blockNumber - blockTransaction.blockNumber,
      blockNumber: blockTransaction.blockNumber,
    })

    return this.web3.eth
      .getTransactionReceipt(transactionHash)
      .then(transactionReceipt => {
        if (transactionReceipt) {
          // NOTE: old version of web3.js (pre 1.0.0-beta.34) are not parsing 0x0 into a falsy value
          if (
            !transactionReceipt.status ||
            transactionReceipt.status == '0x0'
          ) {
            return this.emit('transaction.updated', transactionHash, {
              status: 'failed',
            })
          }

          return this.parseTransactionLogsFromReceipt(
            transactionHash,
            contract,
            transactionReceipt
          )
        }
      })
  })
}
