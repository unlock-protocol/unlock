export default async function (
  { lockAddress, keyPrice, tokenAddress = 0 },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  const transactionPromise = lockContract.updateKeypricing(
    keyPrice,
    tokenAddress
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
