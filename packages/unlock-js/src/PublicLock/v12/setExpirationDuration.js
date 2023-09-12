/**
 * Set default duration of a key at creation
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {number} expirationDuration duration of a key (in seconds)
 * @param {function} callback invoked with the transaction hash
 */
export async function setExpirationDuration(
  { lockAddress, expirationDuration },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const maxKeysPerAddress = await lockContract.maxKeysPerAddress()
  const maxNumberOfKeys = await lockContract.maxNumberOfKeys()
  const supply = await lockContract.totalSupply()
  const transactionPromise = lockContract.updateLockConfig(
    expirationDuration,
    supply.lt(maxNumberOfKeys) ? maxNumberOfKeys : supply,
    maxKeysPerAddress
  )
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
}

export default setExpirationDuration
