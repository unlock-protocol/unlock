/**
 * Change lock manager for a specific key
 * @param {string} lockAddress address of the lock
 * @param {string} managerAddress address of the user
 */

export default async function (
  { lockAddress, managerAddress, tokenId },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract.setKeyManagerOf(
    tokenId,
    managerAddress
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
