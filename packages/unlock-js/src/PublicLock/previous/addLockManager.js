/**
 * Add lock manager to Contract
 * @param {string} lockAddress address of the lock
 * @param {string} userAddress address of the user
 */

export default async function (
  { lockAddress, userAddress },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract.addLockManager(userAddress)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
