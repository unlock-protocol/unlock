export async function setMaxNumberOfKeys(
  { lockAddress, maxNumberOfKeys },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const transactionPromise = lockContract.setMaxNumberOfKeys(maxNumberOfKeys)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
}

export default setMaxNumberOfKeys
