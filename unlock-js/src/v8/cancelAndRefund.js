export default async function ({ lockAddress, tokenId }, callback) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!tokenId) {
    const owner = await this.signer.getAddress()
    tokenId = await lockContract.getTokenIdFor(owner)
  }

  const transactionPromise = lockContract.cancelAndRefund(tokenId)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
