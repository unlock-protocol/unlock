/**
 * @param {string} lockAddres address of the lock
 * @param {string} tokenId address of the user
 */
export default async function (lockAddres, tokenId, provider) {
  const lockContract = await this.getLockContract(lockAddres, provider)

  return lockContract.keyManagerOf(tokenId)
}
