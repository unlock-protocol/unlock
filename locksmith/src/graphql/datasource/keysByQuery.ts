import { getValidNumber } from '../../utils/normalizer'
import logger from '../../logger'
import {
  LockFilter,
  KeyFilter as KeyFilterProps,
  OrderDirection,
  SubgraphLock,
  SubgraphService,
  KeyOrderBy,
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
  owners?: string[]
  transactionHash?: string[]
  after?: string
  createdAt?: number
}

const locksByFilter = async ({
  network,
  tokenId,
  filter,
  first = 100,
  skip = 0,
  expireTimestamp,
  addresses = [],
  owners = [],
  transactionHash = [],
  after = '',
}: KeyByFilterProps): Promise<any> => {
  const subgraph = new SubgraphService()

  if (filter === 'all') {
    expireTimestamp = 0
  }

  const keyFilter: KeyFilterProps = {
    tokenId,
  }

  if (after) {
    keyFilter.tokenId_gt = after
  }

  if (filter === 'expired') {
    keyFilter.expiration_lt = expireTimestamp // all expired keys
  } else {
    keyFilter.expiration_gt = expireTimestamp // all non expired keys
  }

  if (owners?.length) {
    keyFilter.owner_in = owners?.map((owner) => owner.toLowerCase()) // lowercase address
  }

  if (transactionHash?.length) {
    keyFilter.transactionsHash_contains_nocase = transactionHash
  }

  const lockFilter: LockFilter = {
    address_in: addresses?.map((address) => address.toLowerCase()), // lowercase address
  }

  const locks = await subgraph.locksKeys(
    {
      first,
      skip,
      where: lockFilter,
      keyFilter,
      keyOrderBy: KeyOrderBy.TokenId,
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
    max: number
    after: string
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
    max = 10000,
    after = '',
  },
}: KeyGetProps): Promise<SubgraphLock[]> => {
  try {
    const first = Math.min(1000, max) // max items

    // need to query all keys ignoring expiration duration when searching by token id
    const expireTimestamp =
      expiration === 'all' || filterKey === 'tokenId'
        ? 0
        : parseInt(`${new Date().getTime() / 1000}`)

    // Filter by tokenId
    const tokenId = filterKey === 'tokenId' ? getValidNumber(search) : undefined

    // Filter by owners
    const owners = filterKey === 'owner' && search ? [search] : undefined

    const transactionHash =
      filterKey === 'transactionHash' && search ? [search] : undefined

    const getData = async (getFromPage: number) => {
      const skip = parseInt(`${getFromPage}`, 10) * first
      // The Graph does not support skipping more than 5000
      // https://thegraph.com/docs/en/querying/graphql-api/#pagination
      return await locksByFilter({
        owners,
        first,
        skip,
        addresses,
        network,
        tokenId,
        expireTimestamp,
        filter: expiration,
        transactionHash,
        after,
      })
    }

    // get the first page
    const locks: SubgraphLock[] = (await getData(page)) ?? {}

    const keysList: any[] = locks[0]?.keys || []

    let getForNextPage = keysList?.length < max

    // get next page keys and add it to the list until the length is equal to MAX_ITEMS
    while (getForNextPage) {
      page = page + 1
      try {
        const [{ keys: nextPageKeys = [] }] = (await getData(page)) ?? {}

        keysList?.push(...(nextPageKeys ?? []))

        // get more if we don't have enough AND we only get a partail page
        getForNextPage = keysList?.length < max && keysList?.length === first
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
