import { ETHERS_MAX_UINT } from '../../constants'
import getTokenIdForOwner from './getTokenIdForOwner'

/**
 * Get key expiration by lock for owner. We return the expiration for the first valid key
 * Or
 * @return Promise<number>
 */
export default async function (lockAddress, owner, network) {
  const lockContract = await this.getLockContract(
    lockAddress,
    this.providerForNetwork(network)
  )

  const numberOfKeys = lockContract.balanceOf(owner)

  const keyExpirations = await Promise.all(
    Array.from({ length: numberOfKeys }).map(async (_, index) => {
      const tokenId = await lockContract.tokenOfOwnerByIndex(owner, index)
      const expiration = await lockContract.keyExpirationTimestampFor(tokenId)
      if (expiration.eq(ETHERS_MAX_UINT)) {
        return -1
      }
      return parseInt(expiration, 10)
    })
  )

  const sortedKeyExpirations = keyExpirations.sort((a, b) => a - b)

  const longestKeyExpiration =
    sortedKeyExpirations[sortedKeyExpirations.length - 1]

  return longestKeyExpiration
}
