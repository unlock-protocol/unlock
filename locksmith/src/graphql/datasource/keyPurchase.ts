import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'

export class KeyPurchase extends UnlockGraphQLDataSource {
  PURCHASES = gql`
    {
      keyPurchases {
        id
        lock
        purchaser
        price
        timestamp
        tokenAddress
      }
    }
  `

  async getKeyPurchases() {
    try {
      const response = await this.query(this.PURCHASES)
      return response.data.keyPurchases
    } catch (error) {
      console.error(error)
    }
  }
}
