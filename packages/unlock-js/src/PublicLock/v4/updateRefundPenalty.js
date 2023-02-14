/**
 * Update refund penalty
 * @param {object} params
 * - {PropTypes.lockAddress} lockAddress : address of the lock for which we update refund penalty
 * - {PropTypes.freeTrialLength} freeTrialLength value
 * - {PropTypes.refundPenaltyBasisPoints} refundPenaltyBasisPoints value
 * @param {function} transactionOptions
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, freeTrialLength, refundPenaltyBasisPoints },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress, this.provider)
  const transactionPromise = lockContract.updateRefundPenalty(
    freeTrialLength,
    refundPenaltyBasisPoints
  )
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }
  // Let's now wait for the keyPrice to have been changed before we return it
  await this.provider.waitForTransaction(hash)
  return name
}
