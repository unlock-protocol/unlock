import { gql } from 'apollo-boost'

export default function keyholdersByLockQuery() {
  return gql`
    query Lock($addresses: [String!], $expiresAfter: BigInt! = 0) {
      locks(where: { address_in: $addresses }) {
        keys(where: { expiration_gt: $expiresAfter }) {
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
