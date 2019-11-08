import { gql } from 'apollo-boost'

export default function keyholdersByLockQuery() {
  return gql`
    query Lock($addresses: [String!]) {
      locks(where: { address_in: $addresses }) {
        keys {
          owner {
            address
          }
          keyId
          expiration
        }
        name
        address
      }
    }
  `
}
