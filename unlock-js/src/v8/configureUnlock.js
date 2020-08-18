/**
 * Creates a lock on behalf of the user, using version v0
 * @param {PropTypes.lock} publicLockTemplateAddress
 * @param {PropTypes.string} globalTokenSymbol
 * @param {PropTypes.string} globalBaseTokenURI
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  {
    publicLockTemplateAddress,
    globalTokenSymbol,
    globalBaseTokenURI,
    unlockDiscountToken,
    wrappedEth,
    estimatedGasForPurchase,
  },
  callback
) {
  const unlockContract = await this.getUnlockContract()
  const configTransaction = await unlockContract.configUnlock(
    unlockDiscountToken,
    wrappedEth,
    estimatedGasForPurchase,
    globalTokenSymbol,
    globalBaseTokenURI
  )
  if (callback) {
    callback(null, configTransaction.hash)
  }
  this.provider.waitForTransaction(configTransaction.hash)

  const deployTemplateTransaction = await unlockContract.setLockTemplate(
    publicLockTemplateAddress
  )

  if (callback) {
    callback(null, deployTemplateTransaction.hash)
  }
  return this.provider.waitForTransaction(deployTemplateTransaction.hash)
}
