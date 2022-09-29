import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

export class Key extends GraphQLDataSource {
  constructor(public network: number) {
    super()
    this.baseURL = networks[network].subgraph?.endpoint
  }

  async getKeys(args: any) {
    const keysQuery = gql`
      query Keys($first: Int, $skip: Int) {
        keys(
          first: $first
          skip: $skip
          orderBy: createdAt
          orderDirection: desc
        ) {
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
      const response = await this.query(keysQuery, {
        variables: { first: args.first, skip: args.skip },
      })
      return response.data.keys
    } catch (error) {
      return []
    }
  }

  async getKey(id: any) {
    const keyQuery = gql`
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
      const response = await this.query(keyQuery, { variables: { id } })
      return response.data.key
    } catch (error) {
      return []
    }
  }
}

export default Key
