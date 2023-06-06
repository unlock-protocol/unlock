/**
 * Change lock manager for a specific key
 * @param {string} lockAddress address of the lock
 * @param {string} managerAddress address of the user
 */

export default async function (
  { lockAddress, owner, to, tokenId },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!owner) {
    owner = await this.signer.getAddress()
  }

  const transactionPromise = lockContract.transferFrom(owner, to, tokenId)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  const tx = await this.provider.waitForTransaction(hash)
  return tx
}
