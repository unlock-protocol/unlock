export default async function ({ lockAddress, account }, callback) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract.addKeyGranter(account)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
  return true
}
