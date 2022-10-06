export async function setExpirationDuration(
  { lockAddress, expirationDuration },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise =
    lockContract.setExpirationDuration(expirationDuration)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
}

export default setExpirationDuration
