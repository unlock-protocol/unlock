import { gql } from 'apollo-boost'

export default function keyHolderQuery() {
  return gql`
    query KeyHolder($address: String!) {
      keyHolders(where: { address_not: $address }) {
        id
        address
        keys {
          id
          keyId
          lock {
            name
            address
            tokenAddress
            price
            expirationDuration
          }
        }
      }
    }
  `
}
