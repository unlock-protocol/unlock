/**
 * Renounce lock manager
 * @param {string} lockAddress address of the lock
 */

export default async function (
  { lockAddress },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract.renounceLockManager()

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
