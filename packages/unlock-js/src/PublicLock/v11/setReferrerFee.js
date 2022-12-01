/**
 * Update referrer fee
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the name
 * - {string} name: the new name of the lock
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, address, feeBasisPoint },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress, this.provider)
  const transactionPromise = lockContract.setReferrerFee(address, feeBasisPoint)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }
  await this.provider.waitForTransaction(hash)
  return null
}
