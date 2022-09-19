export default async function (
  { lockAddress, tokenId, duration = 0 },
  transactionOptions = {},
  callback
) {
  if (!tokenId) {
    throw new Error('Missing tokenId.')
  }

  const lockContract = await this.getLockContract(lockAddress)

  const transactionPromise = lockContract.grantKeyExtension(tokenId, duration)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }
  await this.provider.waitForTransaction(hash)
  return null
}
