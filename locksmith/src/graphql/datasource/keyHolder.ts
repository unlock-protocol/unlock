import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

export class KeyHolder extends GraphQLDataSource {
  async get(address: string, network: number) {
    this.baseURL = networks[network].subgraph.endpointV2

    const keyHolderQuery = gql`
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
      const response = await this.query(keyHolderQuery, {
        variables: { address },
      })

      return response.data.keyHolders
    } catch (error) {
      return []
    }
  }
}

export default KeyHolder
