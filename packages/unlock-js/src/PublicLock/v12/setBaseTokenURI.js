/**
 * Set the base URI to be called when calling `tokenURI()`
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {string} baseTokenURI the full baseTokenURI (with a trailing slash at the end)
 * @param {function} callback invoked with the transaction hash
 */
export async function setBaseTokenURI(
  { lockAddress, baseTokenURI },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const lockName = await lockContract.name()
  const lockSymbol = await lockContract.symbol()
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
  return baseTokenURI
}

export default setBaseTokenURI
