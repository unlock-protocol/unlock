/**
 * Yields true if the user is a key granter
 * In this version, only the lock owner is a manager
 * @param {string} lockAddress address of the lock
 * @param {string} address address of the key grnater
 */
export default async function (lockAddress, address, provider) {
  const lockContract = await this.getLockContract(lockAddress, provider)

  return lockContract.isKeyGranter(address)
}
