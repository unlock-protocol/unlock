import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

export class KeysToRenew extends GraphQLDataSource {
  async getKeysToRenew(
    start: number,
    end: number,
    network: number,
    page: number
  ): Promise<any[]> {
    this.baseURL = networks[network].subgraphURI
    const keysToRenewQuery = gql`
      query Keys($start: Int!, $end: Int!, $skip: Int) {
        keys(
          skip: $skip
          orderBy: expiration
          orderDirection: desc
          where: { expiration_gte: $start, expiration_lte: $end }
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
            version
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

    // Pagination starts at 0
    const first = 100 // 100 by page
    const skip = page * first

    try {
      const response = await this.query(keysToRenewQuery, {
        variables: { start, end, first, skip },
      })

      return response.data.keys // .filter((key: any) => key.lock.version >= 10)
    } catch (error) {
      return []
    }
  }
}
