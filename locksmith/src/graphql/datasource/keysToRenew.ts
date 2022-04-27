import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

export class KeysToRenew extends GraphQLDataSource {
  async getKeysToRenew(
    network: number,
    since: number,
    page: number
  ): Promise<any[]> {
    this.baseURL = networks[network].subgraphURI
    const keysToRenewQuery = gql`
      query Keys($since: Int!, $skip: Int) {
        keys(
          skip: $skip,
          orderBy: expiration, 
          orderDirection: asc,
          where: { expiration_gte: $since }
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
    `

    // Pagination starts at 0
    const first = 100 // 100 by page
    const skip = page * first

    try {
      const response = await this.query(keysToRenewQuery, {
        variables: { since, first, skip },
      })

      return response.data.locks
    } catch (error) {
      return []
    }
  }
}
