/**
 * Get token id by lock for owner
 * @return Promise<number>
 */
export default async function (lockAddress, owner, network) {
  const lockContract = await this.getLockContract(
    lockAddress,
    this.providerForNetwork(network)
  )

  try {
    const tokenId = await lockContract.getTokenIdFor(owner)
    return parseInt(tokenId, 10)
  } catch (error) {
    return 0
  }
}
