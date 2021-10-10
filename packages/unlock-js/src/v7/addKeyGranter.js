export default async function ({ lockAddress, keyGranter }, callback) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract.addKeyGranter(keyGranter)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
  return true
}
