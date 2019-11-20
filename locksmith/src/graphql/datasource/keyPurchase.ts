import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'

// eslint-disable-next-line import/prefer-default-export
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
      return []
    }
  }
}
