import { ethers } from 'ethers'

import PublicLockVersions from './PublicLock'
import UnlockVersions from './Unlock'

export const Errors = {
  MISSING_WEB3: 'MISSING_WEB3',
}

/**
 * UnlockService is class which implements shared behavior between web3Service and walletService.
 * It is not meant to be instantiated (only subclasses should)
 */
export default class UnlockService {
  constructor(networks) {
    this.networks = networks
    this.versionForAddress = {}
  }

  providerForNetwork(networkId) {
    if (!this.networks[networkId]) {
      throw new Error(`Missing config for ${networkId}`)
    }
    // for convenience, pass directly an ethers provider in the `networks` contructor
    if (this.networks[networkId].ethersProvider) {
      return this.networks[networkId].ethersProvider
    }
    return new ethers.providers.JsonRpcProvider(
      this.networks[networkId].provider,
      networkId
    )
  }

  /**
   * Checks if the contract has been deployed at the address.
   * Invokes the callback with the result.
   * Addresses which do not have a contract attached will return 0x
   */
  async isUnlockContractDeployed(network) {
    if (!this.networks[network]) {
      throw new Error(`Missing config for ${network}`)
    }

    let opCode = await this.providerForNetwork(network).getCode(
      this.networks[network].unlockAddress
    )
    return opCode !== '0x'
  }

  /**
   * @param {string} address contract address
   * @param {string} versionRetrievalMethodName the method to call to retrieve the contract version
   */
  async contractAbiVersion(address, versionRetrievalMethodName, provider) {
    const contractAddress = address.toLowerCase()
    let version = this.versionForAddress[contractAddress]

    if (version === undefined) {
      // This was not memo-ized
      version = await this[versionRetrievalMethodName](
        contractAddress,
        provider
      )
      this.versionForAddress[contractAddress] = version
    }

    const contractName = versionRetrievalMethodName.includes('PublicLock')
      ? 'PublicLock'
      : 'Unlock'

    if (contractName === 'PublicLock') {
      return PublicLockVersions[`v${version}`]
    }
    if (contractName === 'Unlock') {
      return UnlockVersions[`v${version}`]
    }

    throw new Error(
      `Contract ${address} not deployed, or unknown version ${version}`
    )
  }

  async unlockContractAbiVersion(address, provider) {
    // Get the contract address from the provider's netwrk?
    return this.contractAbiVersion(
      address,
      '_getUnlockVersionFromContract',
      provider
    )
  }

  /**
   * Returns the ABI for the Lock contract deployed at the provided address
   * @param {*} address
   */
  async lockContractAbiVersion(address, provider) {
    return this.contractAbiVersion(
      address,
      '_getPublicLockVersionFromContract',
      provider
    )
  }

  /**
   * Private method, which given an address will query the lock and return the version of the lock
   * @param {*} address
   */
  async _getPublicLockVersionFromContract(address, provider) {
    const contract = new ethers.Contract(
      address,
      ['function publicLockVersion() view returns (uint8)'],
      provider
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
   * Private method, which given an address will query the unlock contract to get its version
   * @param {*} address
   */
  async _getUnlockVersionFromContract(address, provider) {
    const contract = new ethers.Contract(
      address,
      ['function unlockVersion() view returns (uint8)'],
      provider
    )
    let version = 0
    try {
      const contractVersion = await contract.unlockVersion()
      version = parseInt(contractVersion, 10) || 0
    } catch (error) {
      // This is an older version of Unlock which did not support unlockVersion
      // It can be either v0 or v1. To distinguish let's use their opcode!
      const opCode = await provider.getCode(address)
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

  getContract(address, contract, provider) {
    return new ethers.Contract(address, contract.abi, provider)
  }

  async getLockContract(lockAddress, provider) {
    const version = await this.lockContractAbiVersion(lockAddress, provider)
    return this.getContract(lockAddress, version.PublicLock, provider)
  }

  async getUnlockContract(unlockAddress, provider) {
    const version = await this.unlockContractAbiVersion(unlockAddress, provider)
    return this.getContract(unlockAddress, version.Unlock, provider)
  }
}
