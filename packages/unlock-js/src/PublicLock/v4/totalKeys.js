/**
 * Returns the number of keys in owner's account.
 * @param {string} lockAddres address of the lock
 * @param {string} owner address of the user
 */
export default async function (lockAddres, owner, provider) {
  const lockContract = await this.getLockContract(lockAddres, provider)

  return lockContract.balanceOf(owner)
}
