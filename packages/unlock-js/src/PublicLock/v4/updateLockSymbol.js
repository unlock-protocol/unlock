/**
 * Update the three-letters symbol of a lock (default to KEY)
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the symbol
 * - {string} symbol: the new symbol of the lock
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, symbol },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress, this.provider)
  const transactionPromise = lockContract.updateLockSymbol(symbol)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }
  // Let's now wait for the keyPrice to have been changed before we return it
  await this.provider.waitForTransaction(hash)
  return symbol
}
