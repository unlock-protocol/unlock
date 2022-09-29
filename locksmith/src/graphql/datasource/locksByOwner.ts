import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

export class LocksByOwner extends GraphQLDataSource {
  async get(owner: string, network: number) {
    this.baseURL = networks[network].subgraph?.endpoint

    const locksByOwnerQuery = gql`
      query Locks($owner: String!) {
        locks(where: { owner: $owner }) {
          id
          address
          name
          tokenAddress
          price
          expirationDuration
          totalSupply
          maxNumberOfKeys
          owner
        }
      }
    `

    try {
      const response = await this.query(locksByOwnerQuery, {
        variables: { owner },
      })

      return response.data.locks
    } catch (error) {
      return []
    }
  }
}
