import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

export class KeyPurchase extends GraphQLDataSource {
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

  async getKeyPurchases(network: number) {
    this.baseURL = networks[network].subgraph?.endpoint

    try {
      const response = await this.query(this.PURCHASES)

      return response.data.keyPurchases
    } catch (error) {
      return []
    }
  }
}
export default KeyPurchase
