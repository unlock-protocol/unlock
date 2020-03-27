/**
 * Yields true if the user is a lock manager
 * In this version, only the lock owner is a manager
 * @param {string} lockAddres address of the lock
 * @param {string} userAddress address of the user
 */
export default async function(lockAddres, userAddress) {
  const lockContract = await this.getLockContract(lockAddres)

  const owner = await lockContract.owner()

  return owner.toLowerCase() === userAddress.toLowerCase()
}
