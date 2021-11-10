/**
 * Configures unlock version v6
 * @param {PropTypes.lock} publicLockTemplateAddress
 * @param {PropTypes.string} globalTokenSymbol
 * @param {PropTypes.string} globalBaseTokenURI
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { publicLockTemplateAddress, globalTokenSymbol, globalBaseTokenURI },
  callback
) {
  const unlockContract = await this.getUnlockContract()
  const transaction = await unlockContract.configUnlock(
    publicLockTemplateAddress,
    globalTokenSymbol,
    globalBaseTokenURI
  )

  if (callback) {
    callback(null, transaction.hash)
  }

  return this.provider.waitForTransaction(transaction.hash)
}
