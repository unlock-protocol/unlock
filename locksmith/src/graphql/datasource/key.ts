import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'

// eslint-disable-next-line import/prefer-default-export
export class Key extends UnlockGraphQLDataSource {
  async getKeys(args: any) {
    let queryPredicate = args.first ? `(first: ${args.first})` : ''

    let keysQuery = gql`
      query Keys($first: Int) {
        keys${queryPredicate}{
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
      let response = await this.query(keysQuery, {
        variables: { first: args.first },
      })
      return response.data.keys
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
