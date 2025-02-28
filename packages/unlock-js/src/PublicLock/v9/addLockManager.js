import { ethers } from 'ethers'

/**
 * Add lock manager to Contract
 * @param {string} lockAddress address of the lock
 * @param {string} userAddress address of the user
 */
export default async function (
  { lockAddress, userAddress },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const role = ethers.keccak256(ethers.toUtf8Bytes('LOCK_MANAGER'))
  const transactionPromise = lockContract.grantRole(role, userAddress)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
