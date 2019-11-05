import { gql } from 'apollo-boost'

export default function keyholdersByLockQuery() {
  return gql`
    query Lock($address: String!) {
      locks(where: { address: $address }) {
        keys {
          owner {
            address
          }
          keyId
          expiration
        }
        name
      }
    }
  `
}
