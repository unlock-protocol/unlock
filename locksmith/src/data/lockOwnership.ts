import { Web3Service } from '@unlock-protocol/unlock-js'

const lockOperations = require('../operations/lockOperations')

const { updateLockOwnership } = lockOperations
const { networks } = require('../networks')

export default class LockOwnership {
  static async update(addresses: string[], chain: number) {
    const readOnlyEthereumAccess = new Web3Service(networks)

    for (const address of addresses) {
      await this.fetchAndUpdate(readOnlyEthereumAccess, address, chain)
    }
  }

  static async fetchAndUpdate(
    readOnlyInstance: any,
    address: string,
    chain: number
  ) {
    const lock = await readOnlyInstance.getLock(address)
    if (lock) {
      await updateLockOwnership(address, lock.owner, chain)
    }
  }
}
