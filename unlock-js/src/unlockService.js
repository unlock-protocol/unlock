import EventEmitter from 'events'

import * as UnlockV0 from 'unlock-abi-0'
import * as UnlockV01 from 'unlock-abi-0-1'
import * as UnlockV02 from 'unlock-abi-0-2'

import v0 from './v0'
import v01 from './v01'
import v02 from './v02'

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
    // Used for Locks
    this.opCodeForAddress = {
      // '0x123': '0xopCode'
    }

    // Used for Unlock
    this.versionForAddress = {}
  }

  /**
   * Returns the implementation based on the deployed version
   * @param {*} address
   */
  async unlockContractAbiVersion() {
    if (!this.web3) {
      throw new Error(Errors.MISSING_WEB3)
    }

    let version = this.versionForAddress[this.unlockContractAddress]
    if (!version) {
      // This was no memo-ized
      version = await this._getVersionFromContract(this.unlockContractAddress)
      this.versionForAddress[this.unlockContractAddress] = version
    }

    if (2 === version) {
      return v02
    }

    // Defaults to v0
    return v0
  }

  /**
   * Returns the ABI for the Lock contract deployed at the provided address
   * @param {*} address
   */
  async lockContractAbiVersion(address) {
    if (!this.web3) {
      throw new Error(Errors.MISSING_WEB3)
    }

    let opCode = this.opCodeForAddress[address]
    if (!opCode) {
      // This was not memo-ized
      opCode = await this.web3.eth.getCode(address)
      this.opCodeForAddress[address] = opCode
    }

    if (opCode === '0x') {
      throw new Error(Errors.NON_DEPLOYED_CONTRACT)
    }

    if (UnlockV0.PublicLock.deployedBytecode === opCode) {
      return v0
    }

    if (UnlockV01.PublicLock.deployedBytecode === opCode) {
      return v01
    }

    if (UnlockV02.PublicLock.deployedBytecode === opCode) {
      return v02
    }

    // throw new Error(Errors.UNKNOWN_CONTRACT)
    return v0 // TODO: we currently default to v0 because the deployed version may bot match the content of the npm module. Change this once we have certainty over the deployed contract.
  }

  /**
   * Private method, which given an address will query the contract and return the corresponding method
   * @param {*} address
   */
  async _getVersionFromContract(address) {
    const contract = new this.web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [],
          name: 'unlockVersion',
          outputs: [
            {
              name: '',
              type: 'uint8',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ],
      address
    )
    let version = 0
    try {
      const contractVersion = await contract.methods.unlockVersion().call()
      version = parseInt(contractVersion, 10) || 0
    } catch (error) {
      // This is an older version of Unlock which did not support unlockVersion
    }
    return version
  }
}
