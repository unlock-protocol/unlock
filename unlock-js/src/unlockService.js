import EventEmitter from 'events'
import { ethers } from 'ethers'

import v0 from './v0'
import v1 from './v1'
import v2 from './v2'
import v3 from './v3'
import v4 from './v4'
import v5 from './v5'
import v6 from './v6'
import v7 from './v7'

// mute warnings from overloaded smart contract methods (https://github.com/ethers-io/ethers.js/issues/499)
ethers.errors.setLogLevel('error')

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
    // Used to cache
    this.versionForAddress = {}
    this.unlockContract = null
    // this will populate on-demand as locks are accessed
    this.lockContracts = {}
  }

  /**
   * @param {string} address contract address
   * @param {string} versionRetrievalMethodName the method to call to retrieve the contract version
   */
  async contractAbiVersion(address, versionRetrievalMethodName) {
    if (!this.provider) {
      throw new Error(Errors.MISSING_WEB3)
    }

    // ethereum has 2 kinds of addresses, this ensures we don't
    // accidentally store the same contract twice
    // see https://docs.ethers.io/ethers.js/html/notes.html#checksum-address
    const contractAddress = address.toLowerCase()
    let version = this.versionForAddress[contractAddress]
    if (version === undefined) {
      // This was not memo-ized
      version = await this[versionRetrievalMethodName](contractAddress)
      this.versionForAddress[contractAddress] = version
    }

    if (version === 1) {
      return v1
    }

    if (version === 2) {
      return v2
    }

    if (version === 3) {
      return v3
    }

    if (version === 4) {
      return v4
    }

    if (version === 5) {
      return v5
    }

    if (version === 6) {
      return v6
    }

    if (version === 7) {
      return v7
    }

    // Defaults to v0
    return v0
  }

  async unlockContractAbiVersion() {
    return this.contractAbiVersion(
      this.unlockContractAddress,
      '_getVersionFromContract'
    )
  }

  /**
   * Returns the ABI for the Lock contract deployed at the provided address
   * @param {*} address
   */
  async lockContractAbiVersion(address) {
    return this.contractAbiVersion(address, '_getPublicLockVersionFromContract')
  }

  /**
   * Private method, which given an address will query the lock and return the version of the lock
   * @param {*} address
   */
  async _getPublicLockVersionFromContract(address) {
    const contract = new ethers.Contract(
      address,
      ['function publicLockVersion() view returns (uint8)'],
      this.provider
    )
    let version = 0
    try {
      const contractVersion = await contract.publicLockVersion()
      version = parseInt(contractVersion, 10) || 0
      if (version === 1) {
        // v2 returns 1 as publicLockVersion
        const code = await this.provider.getCode(address)

        // if the deployed bytecode is v2, we have a match
        if (v2.PublicLock.bytecodeHash === ethers.utils.sha256(code)) {
          return 2
        }
      }
    } catch (error) {
      // This is an older version of Unlock which did not support publicLockVersion
    }
    return version
  }

  /**
   * Private method, which given an address will query the unlock contract to get its version
   * @param {*} address
   */
  async _getVersionFromContract(address) {
    const contract = new ethers.Contract(
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
      // It can be either v0 or v1. To distinguish let's use their opcode!
      const opCode = await this.provider.getCode(address)
      const hash = ethers.utils.sha256(opCode)
      if (
        hash ===
        '0x886b9da11c0a665e98fd914bc79908925a4f6a549286de92ee6825e441a26309'
      ) {
        version = 1
      }
    }
    return version
  }

  getContract(address, contract) {
    if (this.writable) return this.getWritableContract(address, contract)
    return new ethers.Contract(address, contract.abi, this.provider)
  }

  async getWritableContract(address, contract) {
    return new ethers.Contract(address, contract.abi, this.signer)
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
    const version = await this.unlockContractAbiVersion()
    this.unlockContract = this.getContract(
      this.unlockContractAddress,
      version.Unlock,
      this.provider
    )
    return this.unlockContract
  }
}
