import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

export class Lock extends GraphQLDataSource {
  async getLocks(args: any, network: number) {
    this.baseURL = networks[network].subgraphURI

    const LocksQuery = gql`
      query Locks($first: Int) {
        locks(first: $first) {
          id
          address
          name
          tokenAddress
          price
          creationBlock
          totalSupply
          maxNumberOfKeys
          LockManagers {
            id
            address
          }
          owner
          version
          keys {
            id
            keyId
            expiration
            owner {
              id
              address
            }
            tokenURI
            createdAt
          }
        }
      }
    `

    try {
      const response = await this.query(LocksQuery, {
        variables: { first: args.first },
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
          creationBlock
          totalSupply
          maxNumberOfKeys
          LockManagers {
            id
            address
          }
          owner
          version
          keys {
            id
            keyId
            expiration
            owner {
              id
              address
            }
            tokenURI
            createdAt
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
