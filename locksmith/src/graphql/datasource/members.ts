import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'
import gql from 'graphql-tag'
import { DocumentNode } from 'graphql'

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
  query: string
  page: number
  type?: MemberFilter
}

export class Members extends GraphQLDataSource {
  constructor(public network: number) {
    super()
    this.baseURL = networks[network].subgraphURI
  }

  async get({
    addresses = [],
    query = '',
    type = 'all',
    page = 0,
  }: MemberGetProps) {
    try {
      console.log(addresses)

      const first = 30
      const skip = page * first
      const expireTimestamp = parseInt(`${new Date().getTime() / 1000}`)

      const response = await this.query(QUERY_BY_TYPE[type], {
        variables: {
          addresses,
          search: query || '',
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
