import { ethers } from 'ethers'
import utils from './utils'
import UnlockService from './unlockService'
import {
  getErc20TokenSymbol,
  getErc20BalanceForAddress,
  getErc20Decimals,
} from './erc20'

/**
 * This service reads data from the RPC endpoint.
 * All transactions should be sent via the WalletService.
 */
/**
 * Constructor is called with an object
 * {
 *    [networkId]: {
 *      provider: string,
 *      unlockAddress: string,
 *    },
 *    [networkId2]: {
 *      provider: string,
 *      unlockAddress: string,
 *    }
 *    [networkId3]: {
 *      provider: string,
 *      unlockAddress: string,
 *    }
 * }
 */
export default class Web3Service extends UnlockService {
  /**
   * Method which returns the create2 address based on the factory contract (unlock), the lock template,
   * the account and lock salt (both used to create a unique salt)
   * 0x3d602d80600a3d3981f3363d3d373d3d3d363d73 and 5af43d82803e903d91602b57fd5bf3 are the
   * bytecode for eip-1167 (which defines proxies for locks).
   * @private
   */
  _create2Address(unlockAddress, templateAddress, account, lockSalt) {
    const saltHex = `${account}${lockSalt}`
    const byteCode = `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${templateAddress.replace(
      /0x/,
      ''
    )}5af43d82803e903d91602b57fd5bf3`
    const byteCodeHash = utils.sha3(byteCode)

    const seed = ['ff', unlockAddress, saltHex, byteCodeHash]
      .map((x) => x.replace(/0x/, ''))
      .join('')

    const address = utils.sha3(`0x${seed}`).slice(-40)

    return utils.toChecksumAddress(`0x${address}`)
  }

  /**
   * "Guesses" what the next Lock's address is going to be
   * After that, we need the lock object because create2 uses a salt which is used to know the address
   * TODO : ideally this code should be part of ethers... but it looks like it's not there yet.
   * For now, losely inspired by
   * https://github.com/HardlyDifficult/hardlydifficult-ethereum-contracts/blob/master/src/utils/create2.js#L29
   */
  async generateLockAddress(owner, lock, network) {
    if (!this.networks[network]) {
      throw new Error(`Missing config for ${network}`)
    }

    const unlockContact = await this.getUnlockContract(
      this.networks[network].unlockAddress,
      this.providerForNetwork(network)
    )
    if (unlockContact.publicLockAddress) {
      const templateAddress = await unlockContact.publicLockAddress()
      // Compute the hash identically to v5 (TODO: extract this?)
      const lockSalt = utils.sha3(utils.utf8ToHex(lock.name)).substring(2, 26) // 2+24
      return this._create2Address(
        this.networks[network].unlockAddress,
        templateAddress,
        owner,
        lockSalt
      )
    }
    return ethers.constants.AddressZero
  }

  /**
   * Returns details about a transaction
   * @param {*} hash
   * @param {*} network
   * @returns
   */
  async getTransaction(hash, network) {
    return await this.providerForNetwork(network).getTransaction(hash)
  }

  /**
   * This retrieves the balance of an address (contract or account)
   * and formats it to a string of ether.
   * Returns a promise with the balance
   */
  async getAddressBalance(address, network) {
    const balance = await this.providerForNetwork(network).getBalance(address)
    return utils.fromWei(balance, 'ether')
  }

  /**
   * Refresh the lock's data.
   * We use the block version
   * @return Promise<Lock>
   */
  async getLock(address, network) {
    const version = await this.lockContractAbiVersion(
      address,
      this.providerForNetwork(network)
    )
    const lock = version.getLock.bind(this)(
      address,
      this.providerForNetwork(network)
    )
    lock.address = address
    return lock
  }

  /**
   * Tell whether a user is a manager for the lock
   * @param {string} lock
   * @param {string} manager
   * @return Promise<boolean>
   */
  async isLockManager(lock, manager, network) {
    const version = await this.lockContractAbiVersion(
      lock,
      this.providerForNetwork(network)
    )
    if (!version.isLockManager) {
      throw new Error('Lock version not supported')
    }
    return version.isLockManager.bind(this)(
      lock,
      manager,
      this.providerForNetwork(network)
    )
  }

  /**
   * Returns the key to the lock by the account.
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   */
  async getKeyByLockForOwner(lock, owner, network) {
    const expiration = await this.getKeyExpirationByLockForOwner(
      lock,
      owner,
      network
    )
    const tokenId = await this.getTokenIdForOwner(lock, owner, network)
    const keyPayload = {
      tokenId,
      lock,
      owner,
      expiration,
    }
    return keyPayload
  }

  /**
   * Returns the key expiration to the lock by the account.
   * @private
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   * @return Promise<>
   */
  async getKeyExpirationByLockForOwner(lock, owner, network) {
    const lockContract = await this.getLockContract(
      lock,
      this.providerForNetwork(network)
    )

    try {
      const expiration = await lockContract.keyExpirationTimestampFor(owner)
      if (
        expiration ==
        '3963877391197344453575983046348115674221700746820753546331534351508065746944'
      ) {
        // Handling NO_SUCH_KEY
        // this portion is probably unnecessary, will need to test against the app to be sure
        return 0
      }
      return parseInt(expiration, 10)
    } catch (error) {
      return 0
    }
  }

  /**
   * Returns the key expiration to the lock by the account.
   * @private
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   * @return Promise<>
   */
  async getTokenIdForOwner(lock, owner, network) {
    const lockContract = await this.getLockContract(
      lock,
      this.providerForNetwork(network)
    )

    try {
      const tokenId = await lockContract.getTokenIdFor(owner)
      return parseInt(tokenId, 10)
    } catch (error) {
      return 0
    }
  }

  /**
   * Given some data and a signed version of the same, returns the address of the account that signed it
   * @param data
   * @param signedData
   * @returns {Promise<*>}
   */
  async recoverAccountFromSignedData(data, signedData) {
    return utils.verifyMessage(data, signedData)
  }

  /**
   * Given an ERC20 token contract address, resolve with the symbol that identifies that token.
   * @param {string} contractAddress
   * @returns {Promise<string>}
   */
  async getTokenSymbol(contractAddress, network) {
    const symbolPromise = getErc20TokenSymbol(
      contractAddress,
      this.providerForNetwork(network)
    )
    return symbolPromise
  }

  /**
   * Given an ERC20 token contract address, resolve with the provided user's balance of that token.
   * @param {string} contractAddress
   * @param {string} userWalletAddress
   * @returns {Promise<string>}
   */
  async getTokenBalance(contractAddress, userWalletAddress, network) {
    const balance = await getErc20BalanceForAddress(
      contractAddress,
      userWalletAddress,
      this.providerForNetwork(network)
    )
    const decimals = await getErc20Decimals(
      contractAddress,
      this.providerForNetwork(network)
    )
    return utils.fromDecimal(balance, decimals)
  }

  /**
   * Yields true if an address is key granter on a lock
   */
  async isKeyGranter(lockAddress, address, network) {
    const version = await this.lockContractAbiVersion(
      lockAddress,
      this.providerForNetwork(network)
    )
    if (!version.isKeyGranter) {
      throw new Error('Lock version not supported')
    }

    return version.isKeyGranter.bind(this)(
      lockAddress,
      address,
      this.providerForNetwork(network)
    )
  }

  /**
   * Retrieves the key manager for a key
   * @param {*} lockAddress
   * @param {*} tokenId
   * @param {*} network
   */
  async keyManagerOf(lockAddress, tokenId, network) {
    const version = await this.lockContractAbiVersion(
      lockAddress,
      this.providerForNetwork(network)
    )
    if (!version.keyManagerOf) {
      throw new Error('Lock version not supported')
    }
    return version.keyManagerOf.bind(this)(
      lockAddress,
      tokenId,
      this.providerForNetwork(network)
    )
  }

  /**
   * Returns the owner of a key
   * @param {*} lockAddress
   * @param {*} tokenId
   * @param {*} network
   */
  async ownerOf(lockAddress, tokenId, network) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    return lockContract.ownerOf(tokenId)
  }

  /**
   * Returns the Ethers contract 'connected' (should be used with care)
   * @param {*} lockAddress
   * @param {*} network
   */
  async lockContract(lockAddress, network) {
    return await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
  }
}
