import { ethers } from 'ethers'

export default async function (
  { lockAddress, keyGranter },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const keyGranterRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('KEY_GRANTER')
  )
  const transactionPromise = lockContract.grantRole(keyGranterRole, keyGranter)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
  return true
}
