/**
 * Set symbol of the lock
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {string} symbol a symbol of 3-4 letters
 * @param {function} callback invoked with the transaction hash
 */
export async function updateLockSymbol(
  { lockAddress, symbol },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const lockName = await lockContract.name()
  const baseTokenURI = await lockContract.tokenURI(0)
  const transactionPromise = lockContract.setLockMetadata(
    lockName,
    symbol,
    baseTokenURI
  )
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)

  return symbol
}

export default updateLockSymbol
