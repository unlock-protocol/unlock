import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'

// eslint-disable-next-line import/prefer-default-export
export class KeyHolder extends UnlockGraphQLDataSource {
  async get(address: string) {
    let keyHolderQuery = gql`
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
            }
          }
        }
      }
    `

    try {
      let response = await this.query(keyHolderQuery, {
        variables: { address: address },
      })

      return response.data.keyHolders
    } catch (error) {
      return []
    }
  }
}
