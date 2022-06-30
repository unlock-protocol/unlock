import { gql } from 'apollo-boost'

export default function keyholdersByLockQuery() {
  return gql`
    query Lock(
      $addresses: [String!]
      $expiresAfter: BigInt! = 0
      $first: Int! = 100
      $skip: Int! = 0
      $owner: String = "0x4"
    ) {
      locks(where: { address_in: $addresses }) {
        keys(
          where: { expiration_gt: $expiresAfter, owner_contains: $owner }
          first: $first
          skip: $skip
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
}
