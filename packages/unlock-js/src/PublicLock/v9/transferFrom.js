/**
 * Change lock manager for a specific key
 * @param {string} lockAddress address of the lock
 * @param {string} managerAddress address of the user
 */

export default async function (
  { lockAddress, keyOwner, to, tokenId },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  const transactionPromise = lockContract.transferFrom(keyOwner, to, tokenId)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  const tx = await this.provider.waitForTransaction(hash)
  return tx
}
