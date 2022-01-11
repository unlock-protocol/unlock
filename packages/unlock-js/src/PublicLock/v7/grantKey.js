export default async function (
  { lockAddress, recipient, expiration, keyManager },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!expiration) {
    // Let's get the expiration from the duration (+/- given that the transaction can take time to be mined!)
    const duration = await lockContract.expirationDuration()
    expiration = Math.floor(new Date().getTime() / 1000 + duration.toNumber())
  }

  if (!keyManager) {
    // By default the the key manager is the granter
    const signer = this.signer
    keyManager = await signer.getAddress()
  }

  const grantKeysOptions = {}
  const transactionPromise = lockContract.grantKeys(
    [recipient],
    [expiration],
    [keyManager],
    grantKeysOptions
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)
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
