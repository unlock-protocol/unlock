/**
 * Update the base token URI of the lock
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the name
 * - {string} baseTokenURI: the new base tokenURI that will be use by the lock
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, baseTokenURI },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress, this.provider)
  const transactionPromise = lockContract.setBaseTokenURI(baseTokenURI)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }
  // Let's now wait for the keyPrice to have been changed before we return it
  await this.provider.waitForTransaction(hash)
  return baseTokenURI
}
