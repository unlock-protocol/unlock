import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'
import gql from 'graphql-tag'
import { DocumentNode } from 'graphql'
import { getValidNumber } from '../../utils/normalizer'

export type KeyFilter = 'all' | 'active' | 'expired' | 'tokenId'
const keyholdersByTokedIdQuery = gql`
  query Lock(
    $addresses: [String!]
    $expireTimestamp: BigInt! = 0
    $first: Int! = 100
    $skip: Int! = 0
    $tokenId: BigInt
  ) {
    locks(where: { address_in: $addresses }) {
      keys(
        where: { expiration_gt: $expireTimestamp, tokenId: $tokenId }
        first: $first
        skip: $skip
        orderBy: tokenId
        orderDirection: asc
      ) {
        owner
        tokenId
        expiration
      }
      name
      address
    }
  }
`

const ActiveKeys = gql`
  query Lock(
    $addresses: [String!]
    $expireTimestamp: BigInt! = 0
    $first: Int! = 100
    $skip: Int! = 0
    $owner: String = ""
  ) {
    locks(where: { address_in: $addresses }) {
      keys(
        where: { expiration_gt: $expireTimestamp, owner_contains: $owner }
        first: $first
        skip: $skip
        orderBy: tokenId
        orderDirection: asc
      ) {
        owner
        tokenId
        expiration
      }
      name
      address
    }
  }
`

const ExpiredKeys = gql`
  query Lock(
    $addresses: [String!]
    $expireTimestamp: BigInt! = 0
    $first: Int! = 100
    $skip: Int! = 0
    $owner: String = ""
  ) {
    locks(where: { address_in: $addresses }) {
      keys(
        where: { expiration_lt: $expireTimestamp, owner_contains: $owner }
        first: $first
        skip: $skip
        orderBy: tokenId
        orderDirection: asc
      ) {
        owner
        tokenId
        expiration
      }
      name
      address
    }
  }
`

const keyListByLock = gql`
  query Lock(
    $addresses: [String!]
    $first: Int! = 100
    $skip: Int! = 0
    $owner: String = ""
  ) {
    locks(where: { address_in: $addresses }) {
      keys(
        where: { expiration_gt: 0, owner_contains: $owner }
        first: $first
        skip: $skip
        orderBy: tokenId
        orderDirection: asc
      ) {
        owner
        tokenId
        expiration
      }
      name
      address
    }
  }
`

const QUERY_BY_TYPE: { [key in KeyFilter]: DocumentNode } = {
  active: ActiveKeys,
  expired: ExpiredKeys,
  all: keyListByLock,
  tokenId: keyholdersByTokedIdQuery,
}

interface KeyGetProps {
  addresses: string[]
  filters: {
    query: string
    filterKey: string
    page: number
    expiration: KeyFilter
  }
}

export class keysByQuery extends GraphQLDataSource {
  constructor(public network: number) {
    super()
    this.baseURL = networks[network].subgraph.endpointV2
  }

  async get({
    addresses = [],
    filters: {
      query: search,
      filterKey = 'owner',
      expiration = 'active',
      page = 0,
    },
  }: KeyGetProps) {
    try {
      const first = 1000 // max items

      // need to query all keys ignoring expiration duration when searching by token id
      const expireTimestamp =
        expiration === 'all' || filterKey === 'tokenId'
          ? 0
          : parseInt(`${new Date().getTime() / 1000}`)
      const tokenId = getValidNumber(search)

      let query: any
      if (filterKey === 'tokenId' && `${search}`?.length) {
        query = QUERY_BY_TYPE.tokenId
      } else {
        query = QUERY_BY_TYPE[expiration]
      }

      const getData = async (getFromPage = page) => {
        const skip = parseInt(`${getFromPage}`, 10) * first
        return await this.query(query, {
          variables: {
            addresses,
            tokenId,
            first,
            skip,
            expireTimestamp,
          },
        })
      }
      const {
        data: { locks },
      } = (await getData()) ?? {}

      const keysList = locks[0]?.keys ?? []

      let getForNextPage = keysList?.length === first

      // get next page keys and add it to the list until the length is equal to MAX_ITEMS
      while (getForNextPage) {
        page = page + 1

        const {
          data: {
            locks: [{ keys: nextPageKeys = [] }],
          },
        } = (await getData()) ?? {}

        keysList?.push(...(nextPageKeys ?? []))

        getForNextPage = nextPageKeys?.length === first
      }

      return locks
    } catch (error) {
      return []
    }
  }
}
export default keysByQuery
