/* eslint-disable no-await-in-loop */
/**
 * Returns the first tokenId for the user valid if any, or first if none is valid
 * @return Promise<Lock>
 */
export default async function (
  lockAddress: string,
  owner: string,
  network: number
) {
  const lockContract = await this.getLockContract(
    lockAddress,
    this.providerForNetwork(network)
  )

  const validTokens = []
  const allTokens = []
  const balanceOfTokens = (await lockContract.balanceOf(owner)).toNumber()

  let i = 0
  while (i < balanceOfTokens) {
    let tokenId = (await lockContract.tokenOfOwnerByIndex(owner, i)).toNumber()
    if (tokenId) {
      allTokens.push(tokenId)
      let expiration = await lockContract.keyExpirationTimestampFor(tokenId)
      if (expiration > new Date().getTime() * 1000) {
        validTokens.push(tokenId)
      }
    }
    i++
  }
  console.log({ validTokens, allTokens })

  return validTokens[0] || allTokens[0] || 0
}
