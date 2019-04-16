/**
 * This is used to identify data which should be changed by a pending transaction
 * @param {*} transactionHash
 * @param {*} contract
 * @param {*} input
 * @param {*} contractAddress
 */
export default function(transactionHash, contract, input, contractAddress) {
  const transactionType = this.getTransactionType(contract, input)

  this.emit('transaction.updated', transactionHash, {
    status: 'pending',
    type: transactionType,
    confirmations: 0,
    blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
  })

  // Let's parse the transaction's input
  const method = contract.abi.find(binaryInterface => {
    return input.startsWith(binaryInterface.signature)
  })

  if (!method) {
    // The invoked function is not part of the ABI... this is an unknown transaction
    return
  }

  // The input actually includes the method signature, which should be removed
  // for parsing of the actual input values.
  input = input.replace(method.signature, '')
  const params = this.web3.eth.abi.decodeParameters(method.inputs, input)
  const handler = this.inputsHandlers[method.name]

  if (handler) {
    return handler(transactionHash, contractAddress, params)
  }
}
