import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'
import Normalizer from '../../utils/normalizer'

export class KeyHoldersByLock extends UnlockGraphQLDataSource {
  async getKeyHolders(addresses: [string], page: number): Promise<any[]> {
    const genKeyHolderQuery = gql`
      query Lock($addresses: [String!], $first: Int!, $skip: Int!) {
        locks(where: { address_in: $addresses }) {
          keys(first: $first, skip: $skip) {
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

    // Pagination starts at 0
    const first = 100 // 100 by page
    const skip = (page * first).toFixed()

    try {
      const response = await this.query(genKeyHolderQuery, {
        variables: { addresses, first, skip },
      })

      return response.data.locks
    } catch (error) {
      return []
    }
  }

  /* Utilized in the members page */
  async getKeyHoldingAddresses(lockAddress: string, page: number) {
    const queryResults = await this.getKeyHolders([lockAddress], page)

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
