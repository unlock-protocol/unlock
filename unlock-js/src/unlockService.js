import EventEmitter from 'events'

import v0 from './v0'
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
    // Used to cache
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

    let version = this.versionForAddress[address]
    if (!version) {
      // This was not memo-ized
      version = await this._getPublicLockVersionFromContract(address)
      this.versionForAddress[address] = version
    }

    // NOTE: we (julien) F'ed up the deploy on the PublicLock and v02 still uses 1 for its version.
    // The good news (luck) is that no contract was ever deployed as v01
    if (1 === version) {
      return v02
    }

    // Defaults to v0
    return v0
  }

  async _getPublicLockVersionFromContract(address) {
    const contract = new this.web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [],
          name: 'publicLockVersion',
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
      const contractVersion = await contract.methods.publicLockVersion().call()
      version = parseInt(contractVersion, 10) || 0
    } catch (error) {
      // This is an older version of Unlock which did not support publicLockVersion
    }
    return version
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
