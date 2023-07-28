import { ethers } from 'ethers'

/**
 * Yields true if the user is a key granter
 * In this version, only the lock owner is a manager
 * @param {string} lockAddress address of the lock
 * @param {string} address address of the key grnater
 */
export default async function (lockAddress, address, provider) {
  const lockContract = await this.getLockContract(lockAddress, provider)
  const keyGranterRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('KEY_GRANTER')
  )

  return lockContract.hasRole(keyGranterRole, address)
}
