import { getValidNumber } from '../../utils/normalizer'
import logger from '../../logger'
import {
  OrderDirection,
  SubgraphLock,
  SubgraphService,
} from '@unlock-protocol/unlock-js'

export type KeyFilter = 'all' | 'active' | 'expired' | 'tokenId'

interface KeyByFilterProps {
  first: number
  skip: number
  network: number
  addresses: string[]
  expireTimestamp: number | undefined
  filter: KeyFilter
  tokenId?: number
}

const locksByFilter = async ({
  network,
  tokenId,
  filter,
  first = 100,
  skip = 0,
  expireTimestamp,
  addresses = [],
}: KeyByFilterProps): Promise<any> => {
  const subgraph = new SubgraphService()

  if (filter === 'all') {
    expireTimestamp = 0
  }

  const query: Record<string, any> =
    filter === 'expired'
      ? {
          expiration_lt: expireTimestamp, // all expired keys
        }
      : {
          expiration_gt: expireTimestamp, // all non expired keys
        }

  const locks = await subgraph.locks(
    {
      first,
      skip,
      where: {
        address_in: addresses?.map((address) => address.toLowerCase()), // lowercase address
        keys_: {
          tokenId: filter === 'tokenId' ? tokenId : undefined,
          ...query,
        },
      },
      orderDirection: OrderDirection.Asc,
    },
    {
      networks: [network],
    }
  )
  return locks || []
}

interface KeyGetProps {
  addresses: string[]
  filters: {
    query: string
    filterKey: string
    page: number
    expiration: KeyFilter
  }
  network: number
}

export const keysByQuery = async ({
  network,
  addresses = [],
  filters: {
    query: search,
    filterKey = 'owner',
    expiration = 'active',
    page = 0,
  },
}: KeyGetProps) => {
  try {
    const first = 1000 // max items

    // need to query all keys ignoring expiration duration when searching by token id
    const expireTimestamp =
      expiration === 'all' || filterKey === 'tokenId'
        ? 0
        : parseInt(`${new Date().getTime() / 1000}`)
    const tokenId = getValidNumber(search)

    const getData = async (getFromPage = page) => {
      const skip = parseInt(`${getFromPage}`, 10) * first
      // The Graph does not support skipping more than 5000
      // https://thegraph.com/docs/en/querying/graphql-api/#pagination

      return await locksByFilter({
        first,
        skip,
        addresses,
        network,
        tokenId,
        expireTimestamp,
        filter: expiration,
      })
    }
    const locks: SubgraphLock[] = (await getData()) ?? {}

    const keysList: any[] = locks[0]?.keys || []

    let getForNextPage = keysList?.length === first

    // get next page keys and add it to the list until the length is equal to MAX_ITEMS
    while (getForNextPage) {
      page = page + 1
      try {
        const [{ keys: nextPageKeys = [] }] = (await getData()) ?? {}

        keysList?.push(...(nextPageKeys ?? []))

        getForNextPage = nextPageKeys?.length === first
      } catch (error) {
        logger.error(error)
        getForNextPage = false // When we have an error, we stop paginating, results will be partial
      }
    }

    return locks || []
  } catch (error) {
    logger.error(error)
    return []
  }
}
