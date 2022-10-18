/**
 * Set symbol of the lock
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {string} lockName a symbol of 3-4 letters
 * @param {function} callback invoked with the transaction hash
 */
export async function updateLockName(
  { lockAddress, lockName },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const lockSymbol = await lockContract.symbol()
  const baseTokenURI = await lockContract.tokenURI(0)
  const transactionPromise = lockContract.setLockMetadata(
    lockName,
    lockSymbol,
    baseTokenURI
  )
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
}

export default updateLockName
