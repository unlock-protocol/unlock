import { gql } from 'apollo-boost'

export default function keyholdersByKeyIdQuery() {
  return gql`
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
}
