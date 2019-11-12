import { gql } from 'apollo-server-express'
import { UnlockGraphQLDataSource } from './unlockGraphQLDataSource'

// eslint-disable-next-line import/prefer-default-export
export class KeyHoldersByLock extends UnlockGraphQLDataSource {
  // eslint-disable-next-line class-methods-use-this
  genKeyHolderQuery(address: string) {
    return gql`
    {
      locks(where: {address: ${address}} }) {
      keys {
        owner {
          address
        }
      }
    }
  }
  `
  }

  async getKeyHolders(address: string) {
    try {
      const response = await this.query(this.genKeyHolderQuery(address))

      return response.data.locks
    } catch (error) {
      return []
    }
  }

  async getKeyHoldingAddresses(lockAddress: string) {
    const queryResults = await this.getKeyHolders(lockAddress)

    try {
      if (queryResults.data.locks === 0) {
        return []
      }
      return queryResults.data.locks
        .map((lock: any) => lock.keys)[0]
        .map((key: any) => key.owner.address)
    } catch {
      return []
    }
  }
}
