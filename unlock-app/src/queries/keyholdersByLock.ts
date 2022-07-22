import { DocumentNode, gql } from 'apollo-boost'
import { MemberFilter } from '~/unlockTypes'
import { keyListByLock } from './keyListByLock'

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

const QUERY_BY_TYPE: { [key in MemberFilter]: DocumentNode } = {
  active: ActiveKeys,
  expired: ExpiredKeys,
  all: keyListByLock,
}

export default function keyholdersByLockQuery(type: MemberFilter) {
  try {
    if (QUERY_BY_TYPE[type]) {
      return QUERY_BY_TYPE[type]
    } else {
      console.error(`${type} is not mapped `)
    }
  } catch (err) {
    console.error(err)
  }
}
