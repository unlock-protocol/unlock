import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'

export class Lock extends UnlockGraphQLDataSource {
  LOCKS = gql`
    {
      locks {
        id
        address
        name
        tokenAddress
        price
        expirationDuration
        totalSupply
        maxNumberOfKeys
      }
    }
  `

  async getLocks() {
    try {
      const response = await this.query(this.LOCKS)

      return response.data.locks
    } catch (error) {
      console.error(error)
    }
  }
}
