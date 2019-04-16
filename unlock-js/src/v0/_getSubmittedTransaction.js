import Web3Utils from 'web3-utils'
import * as UnlockV0 from 'unlock-abi-0'

/**
 * The transaction is still pending: it has been sent to the network but not
 * necessarily received by the node we're asking it (and not mined...)
 * @param {*} transactionHash
 * @param {*} blockNumber
 * @param {object} defaults
 * @private
 */
export default function(transactionHash, blockNumber, defaults) {
  this._watchTransaction(transactionHash)

  // If we have default values for the transaction (passed by the walletService)
  if (defaults) {
    const contract =
      this.unlockContractAddress === Web3Utils.toChecksumAddress(defaults.to)
        ? UnlockV0.Unlock
        : UnlockV0.PublicLock

    return this.parseTransactionFromInput(
      transactionHash,
      contract,
      defaults.input,
      defaults.to
    )
  }

  return this.emit('transaction.updated', transactionHash, {
    status: 'submitted',
    confirmations: 0,
    blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
  })
}
