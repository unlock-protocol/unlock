import EventEmitter from 'events'

import * as UnlockV0 from 'unlock-abi-0'
import * as UnlockV01 from 'unlock-abi-0-1'

import v0 from './v0'
import v01 from './v01'

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
   * This tests for several versions, and if none match, will look to see if the address
   * is actually a proxy address. If it is, then, it will look for the implementation address, but
   * to get it it needs to send a request from the 'admin' address (not signed).
   * @param {*} address
   */
  async unlockContractAbiVersion() {
    if (!this.web3) {
      throw new Error(Errors.MISSING_WEB3)
    }

    let version = await this._contractAbiVersionFromAddress(
      this.unlockContractAddress
    )

    if (version) {
      return version
    }

    // Else: this must be a proxy: let's get the implementation
    let implementation
    try {
      implementation = await this._getImplementationAddressFromProxy(
        this.unlockContractAddress
      )
    } catch (error) {
      // We could not get the implementation address which means this is not a proxy
      throw new Error(Errors.UNKNOWN_CONTRACT)
    }

    version = await this._contractAbiVersionFromAddress(implementation)

    if (version) {
      return version
    }

    // throw new Error(Errors.UNKNOWN_CONTRACT)
    return v0 // TODO: change this once we have certainty over the deployed contract
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

    // throw new Error(Errors.UNKNOWN_CONTRACT)
    return v0 // TODO: we currently default to v0 because the deployed version may bot match the content of the npm module. Change this once we have certainty over the deployed contract.
  }

  /**
   * Private method, which given an address will return the implementation behind it
   * @param {*} address
   */
  async _getImplementationAddressFromProxy(address) {
    const contract = new this.web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [],
          name: 'implementation',
          outputs: [
            {
              name: '',
              type: 'address',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ],
      address
    )
    return contract.methods.implementation().call({
      from: '0x33ab07df7f09e793ddd1e9a25b079989a557119a',
    })
  }

  /**
   * returns the version based on the opCode at an address
   * @param {*} address
   */
  async _contractAbiVersionFromAddress(address) {
    let opCode = this.opCodeForAddress[address]
    if (!opCode) {
      // This was no memo-ized
      opCode = await this.web3.eth.getCode(address)
      this.opCodeForAddress[address] = opCode
    }

    if (opCode === '0x') {
      throw new Error(Errors.NON_DEPLOYED_CONTRACT)
    }

    if (UnlockV0.Unlock.deployedBytecode === opCode) {
      return v0
    }

    if (UnlockV01.Unlock.deployedBytecode === opCode) {
      return v01
    }

    return
  }
}
