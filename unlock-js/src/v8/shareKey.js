export default async function (
  { lockAddress, tokenId, recipient, duration },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  if (!tokenId) {
    // Let's assume transfer by seller :)
    const owner = await this.signer.getAddress()
    tokenId = await lockContract.getTokenIdFor(owner)
  }

  if (!duration) {
    const keyOwner = await lockContract.ownerOf(tokenId)
    const expiration = await lockContract.keyExpirationTimestampFor(keyOwner)
    duration = Math.floor(new Date().getTime() / 1000) - expiration.toNumber()
  }

  const transactionOptions = {}

  const transactionPromise = lockContract.shareKey(
    recipient,
    tokenId,
    duration,
    transactionOptions
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  return await this.provider.waitForTransaction(hash)
}
