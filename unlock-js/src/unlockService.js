import EventEmitter from 'events'

import * as UnlockV0 from 'unlock-abi-0'

import v0 from './v0'

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
    /* Memoization for opCode per address */
    this.opCodeForAddress = {
      // '0x123': '0xopCode'
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

    let opCode = this.opCodeForAddress[this.unlockContractAddress]
    if (!opCode) {
      // This was no memo-ized
      opCode = await this.web3.eth.getCode(this.unlockContractAddress)
      this.opCodeForAddress[this.unlockContractAddress] = opCode
    }

    if (opCode === '0x') {
      throw new Error(Errors.NON_DEPLOYED_CONTRACT)
    }

    if (UnlockV0.Unlock.deployedBytecode === opCode) {
      return v0
    }

    throw new Error(Errors.UNKNOWN_CONTRACT)
  }
}
