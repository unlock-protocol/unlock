import { gql } from 'apollo-boost'

export default function keyHolderQuery() {
  return gql`
    query KeyHolder($address: String!) {
      keyHolders(where: { address: $address }) {
        id
        address
        keys {
          id
          expiration
          keyId
          tokenURI
          lock {
            name
            address
            tokenAddress
            price
            expirationDuration
            owner
          }
        }
      }
    }
  `
}
