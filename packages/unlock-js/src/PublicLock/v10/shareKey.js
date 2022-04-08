export default async function (
  { lockAddress, tokenId, recipient, duration },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  if (!tokenId) {
    throw new Error('shareKey: Missing token id from')
  }

  if (!duration) {
    const expiration = await lockContract.keyExpirationTimestampFor(tokenId)
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

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)

  if (receipt.status === 0) {
    throw new Error('Transaction failed')
  }

  const parser = lockContract.interface
  const transferEvent = receipt.logs
    .map((log) => {
      if (log.address !== lockAddress) return // Some events are triggered by the ERC20 contract
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event && event.name === 'Transfer'
    })[0]

  if (transferEvent) {
    return transferEvent.args.tokenId.toString()
  }
  // There was no Transfer log (transaction failed?)
  return null
}
