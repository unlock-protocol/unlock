export default async function (
  { lockAddress, transferFeeBasisPoints },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract.updateTransferFee(
    transferFeeBasisPoints
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
