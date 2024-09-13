/**
 * Upgrade an existing lock to a higher version
 * @notice The version number can only be incremented by 1
 * @param {string} lockAddress the address of the existing (upgradeable) lock
 * @param {number} lockVersion the version number to upgrade the lock
 * @param {function} callback invoked with the upgrade transaction hash
 */
export default async function (lockAddress, lockVersion, callback) {
  if (typeof lockVersion !== 'bigint')
    throw Error('lockVersion should be a bigint')

  const unlockContract = await this.getUnlockContract()

  // send the upgrade tx
  const transactionPromise = unlockContract.upgradeLock(
    lockAddress,
    lockVersion
  )

  const hash = await this._handleMethodCall(transactionPromise)
  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the lock to be upgraded
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = unlockContract.interface
  const unlockAddress = await unlockContract.getAddress()
  const logs = receipt.logs.map((log) => {
    if (log.address.toLowerCase() !== unlockAddress.toLowerCase()) return
    return parser.parseLog(log)
  })
  const upgradeLockEvent = logs.find(
    (event) => event?.fragment && event.fragment.name === 'LockUpgraded'
  )

  if (upgradeLockEvent) {
    return upgradeLockEvent.args.version
  }

  // There was no LockUpgraded log (transaction failed?)
  return null
}
