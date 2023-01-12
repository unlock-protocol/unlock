import { ETHERS_MAX_UINT } from '../../constants'

/**
 * Get key expiration by lock for owner
 * @return Promise<number>
 */
export default async function (lockAddress, owner, network) {
  const lockContract = await this.getLockContract(
    lockAddress,
    this.providerForNetwork(network)
  )

  if ((await lockContract.publicLockVersion()) > 10) {
    throw new Error('Only available until Lock v10')
  }

  try {
    const expiration = await lockContract.keyExpirationTimestampFor(owner)
    if (
      expiration ==
      '3963877391197344453575983046348115674221700746820753546331534351508065746944'
    ) {
      // Handling NO_SUCH_KEY
      // this portion is probably unnecessary, will need to test against the app to be sure
      return 0
    }
    if (expiration.eq(ETHERS_MAX_UINT)) {
      return -1
    }
    return parseInt(expiration, 10)
  } catch (error) {
    return 0
  }
}
