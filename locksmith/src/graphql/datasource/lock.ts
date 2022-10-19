import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

export class Lock extends GraphQLDataSource {
  constructor(public network: number) {
    super()
    this.baseURL = networks[network].subgraph.endpointV2
  }

  async getLocks(args: any) {
    const LocksQuery = gql`
      query Locks($first: Int, $skip: Int) {
        locks(
          first: $first
          skip: $skip
          orderBy: createdAtBlock
          orderDirection: desc
        ) {
          id
          address
          name
          tokenAddress
          price
          createdAtBlock
          lockManagers
          version
          keys {
            id
            expiration
            owner
            tokenURI
            createdAtBlock
          }
        }
      }
    `

    try {
      const response = await this.query(LocksQuery, {
        variables: { first: args.first, skip: args.skip },
      })
      return response.data.locks
    } catch (error) {
      return []
    }
  }

  async getLock(id: any) {
    const LockQuery = gql`
      query Lock($id: ID!) {
        lock(id: $id) {
          id
          address
          name
          tokenAddress
          price
          createdAtBlock
          lockManagers
          version
          keys {
            id
            expiration
            owner
            tokenURI
            createdAtBlock
          }
        }
      }
    `

    try {
      const response = await this.query(LockQuery, { variables: { id } })
      return response.data.lock
    } catch (error) {
      return []
    }
  }
}

export default Lock
