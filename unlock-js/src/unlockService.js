import EventEmitter from 'events'

import * as UnlockV0 from 'unlock-abi-0'
import * as UnlockV01 from 'unlock-abi-0-1'

export const Errors = {
  MISSING_WEB3: 'MISSING_WEB3',
  NON_DEPLOYED_CONTRACT: 'NON_DEPLOYED_CONTRACT',
  UNKNOWN_CONTRACT: 'UNKNOWN_CONTRACT',
}

/**
 * UnlockService is class which implements shared behavior between web3Service and walletService.
 * It is not meant to be instantiated (only subclasses should)
 */
export default class UnlockService extends EventEmitter {
  constructor({ unlockAddress }) {
    super()
    this.unlockContractAddress = unlockAddress
    this.web3 = null
    /* Memoization for Abi versions per address */
    this.versionForAddress = {
      // '0x123': UnlockV0.PublicLock
    }
  }

  /**
   * Returns the ABI for the Unlock contract deployed
   * Another approach might be to look at the opCode
   * @param {*} address
   */
  async unlockContractAbiVersion() {
    if (!this.web3) {
      throw new Error(Errors.MISSING_WEB3)
    }
    if (this.versionForAddress[this.unlockContractAddress]) {
      // This was memoized!
      return this.versionForAddress[this.unlockContractAddress]
    }

    const opCode = await this.web3.eth.getCode(this.unlockContractAddress)

    if (opCode === '0x') {
      throw new Error(Errors.NON_DEPLOYED_CONTRACT)
    }
    const versions = [UnlockV0, UnlockV01]
    for (let i = 0; i < versions.length; i++) {
      const version = versions[i]
      if (version.Unlock.deployedBytecode === opCode) {
        this.versionForAddress[this.unlockContractAddress] = UnlockV0
        return version
      }
    }
    throw new Error(Errors.UNKNOWN_CONTRACT)
  }
}
