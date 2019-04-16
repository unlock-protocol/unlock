import TransactionTypes from '../transactionTypes'

/**
 * The method sets the transaction's type, based on the data being sent.
 * @param {*} contract
 * @param {*} data
 */
export default function(contract, data) {
  const method = contract.abi.find(binaryInterface => {
    return data.startsWith(binaryInterface.signature)
  })

  // If there is no matching method, return null
  if (!method) {
    return null
  }

  if (contract.contractName === 'Unlock' && method.name === 'createLock') {
    return TransactionTypes.LOCK_CREATION
  }

  if (contract.contractName === 'PublicLock' && method.name === 'purchaseFor') {
    return TransactionTypes.KEY_PURCHASE
  }

  if (contract.contractName === 'PublicLock' && method.name === 'withdraw') {
    return TransactionTypes.WITHDRAWAL
  }

  if (
    contract.contractName === 'PublicLock' &&
    method.name === 'updateKeyPrice'
  ) {
    return TransactionTypes.UPDATE_KEY_PRICE
  }

  // Unknown transaction
  return null
}
