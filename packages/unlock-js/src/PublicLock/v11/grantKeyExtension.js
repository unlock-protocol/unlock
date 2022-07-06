export default async function ({ lockAddress, tokenId }, callback) {
  if (!tokenId) {
    throw new Error('Missing tokenId.')
  }

  const lockContract = await this.getLockContract(lockAddress)

  const transactionPromise = lockContract.grantKeyExtension(tokenId)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }
  await this.provider.waitForTransaction(hash)
  return null
}
