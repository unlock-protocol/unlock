/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {number} tokenIdFrom
 * - {number} tokenIdTo
 * - {number} amount
 * @param {function} callback invoked with the transaction hash
 */
export default async function ({
  lockAddress,
  tokenIdFrom,
  tokenIdTo,
  amount,
  callback,
}) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!tokenIdFrom) {
    throw new Error('Missing tokenId')
  }
  if (!tokenIdTo) {
    throw new Error('Missing tokenId')
  }

  // transfer entire amount if nothing is specified
  if (!amount) {
    amount = await lockContract.keyExpirationTimestampFor(tokenIdFrom)
  }

  const transactionPromise = lockContract.mergeKeys(
    tokenIdFrom,
    tokenIdTo,
    amount
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
