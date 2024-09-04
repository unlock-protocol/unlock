export default async function (
  { lockAddress, from, to, tokenId },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress, this.provider)
  const transactionPromise = lockContract.lendKey(from, to, tokenId)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
  return true
}
