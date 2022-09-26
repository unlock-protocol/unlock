import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'
import gql from 'graphql-tag'
import { DocumentNode } from 'graphql'
import { getValidNumber } from '../../utils/normalizer'

export type KeyFilter = 'all' | 'active' | 'expired' | 'keyId'
const keyholdersByKeyIdQuery = gql`
  query Lock(
    $addresses: [String!]
    $first: Int! = 100
    $skip: Int! = 0
    $keyId: BigInt
  ) {
    locks(where: { address_in: $addresses }) {
      keys(
        where: { expiration_gt: 0, keyId: $keyId }
        first: $first
        skip: $skip
        orderBy: keyId
        orderDirection: asc
      ) {
        owner {
          address
        }
        keyId
        expiration
      }
      name
      address
      owner
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
        orderBy: keyId
        orderDirection: asc
      ) {
        owner {
          address
        }
        keyId
        expiration
      }
      name
      address
      owner
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
        orderBy: keyId
        orderDirection: asc
      ) {
        owner {
          address
        }
        keyId
        expiration
      }
      name
      address
      owner
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
        orderBy: keyId
        orderDirection: asc
      ) {
        owner {
          address
        }
        keyId
        expiration
      }
      name
      address
      owner
    }
  }
`

const QUERY_BY_TYPE: { [key in KeyFilter]: DocumentNode } = {
  active: ActiveKeys,
  expired: ExpiredKeys,
  all: keyListByLock,
  keyId: keyholdersByKeyIdQuery,
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
    this.baseURL = networks[network].subgraphURI
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

      const expireTimestamp = parseInt(`${new Date().getTime() / 1000}`)
      const keyId = getValidNumber(search)

      let query: any
      if (filterKey === 'keyId' && `${search}`?.length) {
        query = QUERY_BY_TYPE.keyId
      } else {
        query = QUERY_BY_TYPE[expiration]
      }

      const getData = async (getFromPage = page) => {
        const skip = parseInt(`${getFromPage}`, 10) * first
        return await this.query(query, {
          variables: {
            addresses,
            keyId,
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
