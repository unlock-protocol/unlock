import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'
import gql from 'graphql-tag'
import { DocumentNode } from 'graphql'
import { getValidNumber } from '../../utils/normalizer'

export type MemberFilter = 'all' | 'active' | 'expired' | 'keyId'
const keyholdersByKeyIdQuery = gql`
  query Lock(
    $addresses: [String!]
    $expireTimestamp: BigInt! = 0
    $first: Int! = 100
    $skip: Int! = 0
    $keyId: BigInt
  ) {
    locks(where: { address_in: $addresses }) {
      keys(
        where: { expiration_gt: $expireTimestamp, keyId: $keyId }
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

const QUERY_BY_TYPE: { [key in MemberFilter]: DocumentNode } = {
  active: ActiveKeys,
  expired: ExpiredKeys,
  all: keyListByLock,
  keyId: keyholdersByKeyIdQuery,
}

interface MemberGetProps {
  addresses: string[]
  filters: {
    query: string
    filterKey: string
    page: number
    expiration: MemberFilter
  }
}

export class Members extends GraphQLDataSource {
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
  }: MemberGetProps) {
    try {
      const first = 30
      const skip = parseInt(`${page}`, 10) * first
      const expireTimestamp = parseInt(`${new Date().getTime() / 1000}`)
      const keyId = getValidNumber(search)

      let query
      if (filterKey === 'keyId' && `${search}`?.length) {
        query = QUERY_BY_TYPE.keyId
      } else {
        query = QUERY_BY_TYPE[expiration]
      }

      const owner = `${search}`?.toLowerCase() ?? ''

      const response = await this.query(query, {
        variables: {
          addresses,
          owner,
          keyId,
          first,
          skip,
          expireTimestamp,
        },
      })
      return response.data.locks
    } catch (error) {
      return []
    }
  }
}
export default Members
