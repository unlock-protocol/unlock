import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'

export class LocksByOwner extends UnlockGraphQLDataSource {
  async get(owner: string) {
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
