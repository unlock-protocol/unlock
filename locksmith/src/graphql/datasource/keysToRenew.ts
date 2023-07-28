import { SubgraphService } from '@unlock-protocol/unlock-js'
import logger from '../../logger'

interface Options {
  limit: number
  start?: number
  end?: number
  network: number
  page: number
  minimumLockVersion: number
  allowNativeCurrency?: boolean
}

export const getKeysToRenew = async ({
  network,
  start,
  end,
  page,
  minimumLockVersion = 10,
  limit = 500,
  allowNativeCurrency = false,
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

    // Filter out keys that are not allowed to be renewed. This includes keys of locks without an erc20 token address and lock version below minimumLockVersion
    const result = keys.filter((item) => {
      const isAllowed =
        item.lock.tokenAddress !==
          '0x0000000000000000000000000000000000000000' || allowNativeCurrency
      return item.lock.version >= minimumLockVersion && isAllowed
    })
    return result
  } catch (error) {
    logger.error(error)
    return []
  }
}
