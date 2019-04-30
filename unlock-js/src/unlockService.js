import EventEmitter from 'events'
import { Contract } from 'ethers'

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
  constructor({ unlockAddress, writable = false }) {
    super()
    this.writable = writable
    this.unlockContractAddress = unlockAddress
    this.web3 = null
    this.provider = null
    /* Memoization for opCode per address */
    // Used to cache
    this.versionForAddress = {}
    this.ethers_versionForAddress = {}
    this.unlockContract = null
    // this will populate on-demand as locks are accessed
    this.lockContracts = {}
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
    if (version === undefined) {
      // This was not memo-ized
      version = await this._getVersionFromContract(this.unlockContractAddress)
      this.versionForAddress[this.unlockContractAddress] = version
    }

    if (1 === version) {
      return v01
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

    let version = this.versionForAddress[address.toLowerCase()]
    if (version === undefined) {
      // This was not memo-ized
      version = await this._getPublicLockVersionFromContract(address)
      this.versionForAddress[address.toLowerCase()] = version
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

  /**
   * Returns the implementation based on the deployed version
   * @param {*} address
   */
  async ethers_unlockContractAbiVersion() {
    if (!this.provider) {
      throw new Error(Errors.MISSING_WEB3)
    }

    let version = this.ethers_versionForAddress[this.unlockContractAddress]
    if (version === undefined) {
      // This was not memo-ized
      version = await this._ethers_getVersionFromContract(
        this.unlockContractAddress
      )
      this.ethers_versionForAddress[this.unlockContractAddress] = version
    }

    if (1 === version) {
      return v01
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
  async ethers_lockContractAbiVersion(address) {
    if (!this.provider) {
      throw new Error(Errors.MISSING_WEB3)
    }

    let version = this.ethers_versionForAddress[address.toLowerCase()]
    if (version === undefined) {
      // This was not memo-ized
      version = await this._ethers_getPublicLockVersionFromContract(address)
      this.ethers_versionForAddress[address.toLowerCase()] = version
    }

    // NOTE: we (julien) F'ed up the deploy on the PublicLock and v02 still uses 1 for its version.
    // The good news (luck) is that no contract was ever deployed as v01
    if (1 === version) {
      return v02
    }

    // Defaults to v0
    return v0
  }

  async _ethers_getPublicLockVersionFromContract(address) {
    const contract = new Contract(
      address,
      ['function publicLockVersion() view returns (uint8)'],
      this.provider
    )
    let version = 0
    try {
      const contractVersion = await contract.publicLockVersion()
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
  async _ethers_getVersionFromContract(address) {
    const contract = new Contract(
      address,
      ['function unlockVersion() view returns (uint8)'],
      this.provider
    )
    let version = 0
    try {
      const contractVersion = await contract.unlockVersion()
      version = parseInt(contractVersion, 10) || 0
    } catch (error) {
      // This is an older version of Unlock which did not support unlockVersion
    }
    return version
  }

  getContract(address, contract) {
    if (this.writable) return this.getWritableContract(address, contract)
    return new Contract(address, contract.abi, this.provider)
  }

  async getWritableContract(address, contract) {
    const signer = this.provider.getSigner()
    return new Contract(address, contract.abi, signer)
  }

  async getLockContract(lockAddress) {
    if (this.lockContracts[lockAddress]) {
      return this.lockContracts[lockAddress]
    }
    const version = await this.lockContractAbiVersion(lockAddress)
    this.lockContracts[lockAddress] = this.getContract(
      lockAddress,
      version.PublicLock,
      this.provider
    )
    return this.lockContracts[lockAddress]
  }

  async getUnlockContract() {
    if (this.unlockContract) {
      return this.unlockContract
    }
    const version = await this.ethers_unlockContractAbiVersion()
    this.unlockContract = this.getContract(
      this.unlockContractAddress,
      version.Unlock,
      this.provider
    )
    return this.unlockContract
  }
}
