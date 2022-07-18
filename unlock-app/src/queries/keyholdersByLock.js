import { gql } from 'apollo-boost'

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

export default function keyholdersByLockQuery(showActive = true) {
  return showActive ? ActiveKeys : ExpiredKeys
}
