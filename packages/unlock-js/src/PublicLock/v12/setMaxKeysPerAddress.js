/**
 * Set maximum number of keys per address
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {number} maxKeysPerAddress of keys
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, maxKeysPerAddress },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const expirationDuration = await lockContract.expirationDuration()
  const maxNumberOfKeys = await lockContract.maxNumberOfKeys()
  const transactionPromise = lockContract.setLockConfig(
    expirationDuration,
    maxNumberOfKeys,
    maxKeysPerAddress
  )
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  await this.provider.waitForTransaction(hash)
}
