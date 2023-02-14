import { SubgraphService } from '@unlock-protocol/unlock-js'
import logger from '../../logger'

interface Options {
  limit: number
  start?: number
  end?: number
  network: number
  page: number
  minimumLockVersion: number
}

export const getKeysToRenew = async ({
  network,
  start,
  end,
  page,
  minimumLockVersion = 10,
  limit = 500,
}: Options) => {
  try {
    const subgraph = new SubgraphService()
    // Pagination starts at 0
    const skip = page * limit
    const keys = await subgraph.keys(
      {
        skip,
        first: limit,
        where: {
          expiration_gte: start,
          expiration_lte: end,
          cancelled: false,
        },
      },
      {
        networks: [network],
      }
    )

    const result = keys.filter(
      (item) =>
        item.lock.version >= minimumLockVersion &&
        item.lock.tokenAddress !== '0x0000000000000000000000000000000000000000'
    )
    return result
  } catch (error) {
    logger.error(error)
    return []
  }
}
