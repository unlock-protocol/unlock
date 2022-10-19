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
    this.baseURL = networks[network].subgraph.endpointV2
    const keysToRenewQuery = gql`
      query Keys($start: Int!, $end: Int!, $skip: Int) {
        keys(
          skip: $skip
          orderBy: expiration
          orderDirection: desc
          where: { expiration_gte: $start, expiration_lte: $end }
        ) {
          id
          tokenId
          lock {
            id
            address
            name
            tokenAddress
            price
            expirationDuration
            version
          }
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

      // return only locks that support recurring memberships
      const renewableLocks = response.data.keys.filter(
        (key: any) =>
          key.lock.version >= 10 &&
          key.lock.tokenAddress !== '0x0000000000000000000000000000000000000000'
      )
      return renewableLocks
    } catch (error) {
      return []
    }
  }
}
