import EventEmitter from 'events'
import { ethers } from 'ethers'

import v0 from './v0'
import v01 from './v01'
import v02 from './v02'
import v10 from './v10'
import v11 from './v11'

import FastJsonRpcSigner from './FastJsonRpcSigner'

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
    /* Memoization for opCode per address */
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

    if (1 === version) {
      return v01
    }

    if (2 === version) {
      return v02
    }

    if (3 === version) {
      return v10
    }

    if (4 === version) {
      return v11
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
        // v02 returns 1 as publicLockVersion
        const code = await this.provider.getCode(address)

        // if the deployed bytecode is v02, we have a match
        if (v02.PublicLock.bytecodeHash === ethers.utils.sha256(code)) {
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
    }
    return version
  }

  getContract(address, contract) {
    if (this.writable) return this.getWritableContract(address, contract)
    return new ethers.Contract(address, contract.abi, this.provider)
  }

  async getWritableContract(address, contract) {
    // TODO: replace this when v5 of ethers is out
    // see https://github.com/ethers-io/ethers.js/issues/511
    const signer = new FastJsonRpcSigner(this.provider.getSigner())
    return new ethers.Contract(address, contract.abi, signer)
  }

  async getLockContract(lockAddress) {
    if (this.lockContracts[lockAddress]) {
      return this.lockContracts[lockAddress]
    } else {
      const version = await this.lockContractAbiVersion(lockAddress)
      this.lockContracts[lockAddress] = this.getContract(
        lockAddress,
        version.PublicLock,
        this.provider
      )
      return this.lockContracts[lockAddress]
    }
  }

  async getUnlockContract() {
    if (this.unlockContract) {
      return this.unlockContract
    } else {
      const version = await this.unlockContractAbiVersion()
      this.unlockContract = this.getContract(
        this.unlockContractAddress,
        version.Unlock,
        this.provider
      )
      return this.unlockContract
    }
  }
}
