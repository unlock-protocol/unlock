/**
 * Set maximum number of keys in the lock
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {number} maxNumberOfKeys max number of keys in the lock
 * @param {function} callback invoked with the transaction hash
 */

export async function setMaxNumberOfKeys(
  { lockAddress, maxNumberOfKeys },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const maxKeysPerAddress = await lockContract.maxKeysPerAddress()
  const expirationDuration = await lockContract.expirationDuration()
  const transactionPromise = lockContract.setLockConfig(
    expirationDuration,
    maxNumberOfKeys,
    maxKeysPerAddress
  )
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
}

export default setMaxNumberOfKeys
