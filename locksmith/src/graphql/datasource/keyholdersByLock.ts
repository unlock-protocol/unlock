import { gql } from 'apollo-server-express'
import { GraphQLDataSource } from 'apollo-datasource-graphql'
import networks from '@unlock-protocol/networks'

import Normalizer from '../../utils/normalizer'

const logger = require('../../logger')

export class KeyHoldersByLock extends GraphQLDataSource {
  async getKeyHolders(
    addresses: [string],
    page: number,
    network: number
  ): Promise<any[]> {
    this.baseURL = networks[network].subgraph?.endpoint

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
    const skip = page * first

    try {
      const response = await this.query(genKeyHolderQuery, {
        variables: { addresses, first, skip },
      })

      return response.data.locks
    } catch (error) {
      logger.error('getKeyHolders failed', error)
      return []
    }
  }

  /* Utilized in the members page */
  async getKeyHoldingAddresses(
    lockAddress: string,
    page: number,
    network: number
  ) {
    const queryResults = await this.getKeyHolders([lockAddress], page, network)

    try {
      if (queryResults.length === 0) {
        return []
      }
      return queryResults[0].keys.map((key: any) =>
        Normalizer.ethereumAddress(key.owner.address)
      )
    } catch (error) {
      logger.error('getKeyHoldingAddresses failed', error)
      return []
    }
  }
}
