import { ETHERS_MAX_UINT } from '../../constants'
import getTokenIdForOwner from './getTokenIdForOwner'

/**
 * Get key expiration by lock for owner. We return the expiration for the first valid key
 * Or
 * @return Promise<number>
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

  // We need to get the id.
  const tokenId = await getTokenIdForOwner.bind(this)(
    lockAddress,
    owner,
    network
  )
  const expiration = await lockContract.keyExpirationTimestampFor(tokenId)
  if (expiration.eq(ETHERS_MAX_UINT)) {
    return -1
  }
  return parseInt(expiration, 10)
}
