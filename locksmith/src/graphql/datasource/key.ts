import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'
import { generateMetadata } from './metaData'

// eslint-disable-next-line import/prefer-default-export
export class Key extends UnlockGraphQLDataSource {
  async getKeys() {
    let keysQuery = gql`
      query Keys {
        keys {
          id
          lock {
            id
            address
            name
            tokenAddress
            price
            expirationDuration
            totalSupply
          }
          keyId
          expiration
          owner {
            id
            address
          }
        }
      }
    `

    try {
      let response = await this.query(keysQuery)
      let enriched = response.data.keys.map(async (key: any) => {
        return {
          ...key,
          metadata: await generateMetadata(key.lock.id, key.keyId),
        }
      })

      return enriched
    } catch (error) {
      return []
    }
  }

  async getKey(id: any) {
    let keyQuery = gql`
      query Key($id: ID!){
      key(id: "${id}") {
        id
        lock {
          id
          address
          name
          tokenAddress
          price
          expirationDuration
          totalSupply
        }
        keyId
        expiration
        owner {
          id
          address
        }
      }
    }
  `

    try {
      const response = await this.query(keyQuery, { variables: { id: id } })
      return response.data.key
    } catch (error) {
      return []
    }
  }
}
