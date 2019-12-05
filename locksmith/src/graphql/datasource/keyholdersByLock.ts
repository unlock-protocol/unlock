import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'
import Normalizer from '../../utils/normalizer'

export class KeyHoldersByLock extends UnlockGraphQLDataSource {
  async getKeyHolders(addresses: [string]): Promise<any[]> {
    const genKeyHolderQuery = gql`
      query Lock($addresses: [String!]) {
        locks(where: { address_in: $addresses }) {
          keys {
            owner {
              address
            }
            keyId
            expiration
          }
          name
          address
        }
      }
    `

    try {
      const response = await this.query(genKeyHolderQuery, {
        variables: { addresses },
      })

      return response.data.locks
    } catch (error) {
      return []
    }
  }

  /* Utilized in the members page */
  async getKeyHoldingAddresses(lockAddress: string) {
    const queryResults = await this.getKeyHolders([lockAddress])

    try {
      if (queryResults.length === 0) {
        return []
      }
      return queryResults[0].keys.map((key: any) =>
        Normalizer.ethereumAddress(key.owner.address)
      )
    } catch {
      return []
    }
  }
}
