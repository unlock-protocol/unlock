import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

import * as lockOperations from '../operations/lockOperations'

const { updateLockOwnership } = lockOperations

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
