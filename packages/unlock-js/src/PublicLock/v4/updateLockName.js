/**
 * Update the name of a lock
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the price
 * - {string} name: the new name of the lock
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, name },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress, this.provider)
  const transactionPromise = lockContract.updateLockName(name)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }
  // Let's now wait for the keyPrice to have been changed before we return it
  await this.provider.waitForTransaction(hash)
  return name
}
