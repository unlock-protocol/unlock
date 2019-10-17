import { Web3Service } from '@unlock-protocol/unlock-js'

const lockOperations = require('../operations/lockOperations')

const { updateLockOwnership } = lockOperations

export default class LockOwnership {
  static async update(host: string, addresses: string[]) {
    let readOnlyEthereumAccess = new Web3Service({
      readOnlyProvider: host,
    })

    for (var address of addresses) {
      await this.fetchAndUpdate(readOnlyEthereumAccess, address)
    }
  }

  static async fetchAndUpdate(readOnlyInstance: any, address: string) {
    let lock = await readOnlyInstance.getLock(address)
    if (lock) {
      await updateLockOwnership(address, lock.owner)
    }
  }
}
