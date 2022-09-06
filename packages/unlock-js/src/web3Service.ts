import { ethers } from 'ethers'
import utils from './utils'
import UnlockService from './unlockService'
import {
  getErc20TokenSymbol,
  getErc20BalanceForAddress,
  getErc20Decimals,
} from './erc20'
import { ETHERS_MAX_UINT } from './constants'

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
  _create2Address(
    unlockAddress: string,
    templateAddress: string,
    account: string,
    lockSalt: string
  ) {
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
   * Returns details about a transaction
   * @param {*} hash
   * @param {*} network
   * @returns
   */
  async getTransaction(hash: string, network: number) {
    return await this.providerForNetwork(network).getTransaction(hash)
  }

  /**
   * This retrieves the balance of an address (contract or account)
   * and formats it to a string of ether.
   * Returns a promise with the balance
   */
  async getAddressBalance(address: string, network: number) {
    const balance = await this.providerForNetwork(network).getBalance(address)
    return utils.fromWei(balance, 'ether')
  }

  /**
   * Refresh the lock's data.
   * We use the block version
   * @return Promise<Lock>
   */
  async getLock(address: string, network: number) {
    const version = await this.lockContractAbiVersion(
      address,
      this.providerForNetwork(network)
    )
    const lock = await version.getLock.bind(this)(
      address,
      this.providerForNetwork(network)
    )
    lock.address = address
    return lock
  }

  /**
   * Tell whether a user is a manager for the lock
   * @param {string} lockAddress
   * @param {string} manager
   * @return Promise<boolean>
   */
  async isLockManager(lockAddress: string, manager: string, network: number) {
    const version = await this.lockContractAbiVersion(
      lockAddress,
      this.providerForNetwork(network)
    )
    if (!version.isLockManager) {
      throw new Error('Lock version not supported')
    }
    return version.isLockManager.bind(this)(
      lockAddress,
      manager,
      this.providerForNetwork(network)
    )
  }

  /**
   * Returns the key to the lock by the token Id.
   * @param {PropTypes.string} lockAddress
   * @param {PropTypes.number} tokenId
   */
  async getKeyByTokenId(lockAddress: string, tokenId: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    if ((await lockContract.publicLockVersion()) < 10) {
      throw new Error('Only available for Lock v10+')
    }
    const expiration = await this.getKeyExpirationByTokenId(
      lockAddress,
      tokenId,
      network
    )
    const owner = await this.ownerOf(lockAddress, tokenId, network)
    const keyPayload = {
      tokenId,
      lock: lockAddress,
      owner,
      expiration,
    }
    return keyPayload
  }

  /**
   * Returns the key expiration to the lock by the account.
   * @private
   * @param {PropTypes.string} lockAddress
   * @param {number} tokenId
   * @return Promise<>
   */
  async getKeyExpirationByTokenId(
    lockAddress: string,
    tokenId: string,
    network: number
  ) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )

    if ((await lockContract.publicLockVersion()) < 10) {
      throw new Error('Only available for Lock v10+')
    }

    try {
      const expiration = await lockContract.keyExpirationTimestampFor(tokenId)
      if (
        expiration ==
        '3963877391197344453575983046348115674221700746820753546331534351508065746944'
      ) {
        // Handling NO_SUCH_KEY
        // this portion is probably unnecessary, will need to test against the app to be sure
        return 0
      }
      if (expiration.eq(ETHERS_MAX_UINT)) {
        return -1
      }
      return parseInt(expiration, 10)
    } catch (error) {
      return 0
    }
  }

  /**
   * Returns the key to the lock by the account.
   * @param {PropTypes.string} lockAddress
   * @param {PropTypes.string} owner
   */
  async getKeyByLockForOwner(
    lockAddress: string,
    owner: string,
    network: number
  ) {
    const keyPayload = {
      lock: lockAddress,
      owner,
      expiration: 0,
      tokenId: 0,
    }

    keyPayload.tokenId = await this.getTokenIdForOwner(
      lockAddress,
      owner,
      network
    )
    keyPayload.expiration = await this.getKeyExpirationByLockForOwner(
      lockAddress,
      owner,
      network
    )

    return keyPayload
  }

  /**
   * Returns true if the address has a valid key (will call the hook when applicable!)
   * @param lockAddress
   * @param owner
   * @param network
   */
  async getHasValidKey(lockAddress: string, owner: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    return lockContract.getHasValidKey(owner)
  }

  /**
   * Returns the key expiration to the lock by the account.
   * @private
   * @param {PropTypes.string} lockAddress
   * @param {PropTypes.string} owner
   * @return Promise<>
   */
  async getKeyExpirationByLockForOwner(
    lockAddress: string,
    owner: string,
    network: number
  ) {
    const version = await this.lockContractAbiVersion(
      lockAddress,
      this.providerForNetwork(network)
    )
    return version.getKeyExpirationByLockForOwner.bind(this)(
      lockAddress,
      owner,
      network
    )
  }

  /**
   * Returns the key expiration to the lock by the account.
   * @private
   * @param {PropTypes.string} lockAddress
   * @param {PropTypes.string} owner
   * @return Promise<>
   */
  async getTokenIdForOwner(
    lockAddress: string,
    owner: string,
    network: number
  ) {
    const version = await this.lockContractAbiVersion(
      lockAddress,
      this.providerForNetwork(network)
    )
    return version.getTokenIdForOwner.bind(this)(lockAddress, owner, network)
  }

  /**
   * Given some data and a signed version of the same, returns the address of the account that signed it
   * @param data
   * @param signedData
   * @returns {Promise<*>}
   */
  async recoverAccountFromSignedData<T extends string | ethers.Bytes>(
    data: T,
    signedData: ethers.Signature
  ) {
    return utils.verifyMessage(data, signedData)
  }

  /**
   * Given an ERC20 token contract address, resolve with the symbol that identifies that token.
   * @param {string} contractAddress
   * @returns {Promise<string>}
   */
  async getTokenSymbol(contractAddress: string, network: number) {
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
  async getTokenBalance(
    contractAddress: string,
    userWalletAddress: string,
    network: number
  ) {
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

  async getTokenDecimals(contractAddress: string, network: number) {
    const provider = this.providerForNetwork(network)
    const decimals = await getErc20Decimals(contractAddress, provider)
    return decimals
  }

  /**
   * Yields true if an address is key granter on a lock
   */
  async isKeyGranter(lockAddress: string, address: string, network: number) {
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
  async keyManagerOf(lockAddress: string, tokenId: string, network: number) {
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
  async ownerOf(lockAddress: string, tokenId: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    return lockContract.ownerOf(tokenId)
  }

  /**
   * Returns id a key is valid or not
   * @param {*} lockAddress
   * @param {*} tokenId
   * @param {*} network
   */
  async isValidKey(lockAddress: string, tokenId: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    return lockContract.isValidKey(tokenId)
  }

  /**
   * Returns the Ethers contract 'connected' (should be used with care)
   * @param {*} lockAddress
   * @param {*} network
   */
  async lockContract(lockAddress: string, network: number) {
    return await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
  }

  /**
   * Returns numbers of owners for a specific lock
   * @param {*} lockAddress
   * @param {*} network
   */
  async numberOfOwners(lockAddress: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    return ethers.BigNumber.from(await lockContract.numberOfOwners()).toNumber()
  }

  /**
   * Returns transfer fee for lock
   * @param {*} lockAddress
   * @param {*} network
   */
  async transferFeeBasisPoints(lockAddress: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )

    // lock < v5
    if (!lockContract.transferFeeBasisPoints) {
      throw new Error('Lock version is not supported')
    }

    return ethers.BigNumber.from(
      await lockContract.transferFeeBasisPoints()
    ).toNumber()
  }

  async getCancelAndRefundValueFor(params: {
    lockAddress: string
    owner: string
    tokenAddress: string
    network: number
  }) {
    const { lockAddress, owner, tokenAddress, network } = params
    if (!lockAddress) {
      throw new Error('Missing lockAddress')
    }
    if (!owner) {
      throw new Error('Missing owner')
    }
    if (!tokenAddress) {
      throw new Error('Missing tokenAddress')
    }
    if (!network) {
      throw new Error('Missing network')
    }

    const version = await this.lockContractAbiVersion(
      lockAddress,
      this.providerForNetwork(network)
    )

    if (!version.getCancelAndRefundValueFor) {
      throw new Error('Lock version not supported')
    }

    return version.getKeyExpirationByLockForOwner.bind(this)(
      lockAddress,
      owner,
      network
    )
  }

  /**
   * Returns total of key for a specific address
   * @param {String} lockAddress
   * @param {String} address
   * @param {Number} network
   */
  async totalKeys(lockAddress: string, owner: string, network: number) {
    const version = await this.lockContractAbiVersion(
      lockAddress,
      this.providerForNetwork(network)
    )

    if (!version.totalKeys) {
      throw new Error('Lock version not supported')
    }

    return ethers.BigNumber.from(
      await version.totalKeys.bind(this)(
        lockAddress,
        owner,
        this.providerForNetwork(network)
      )
    ).toNumber()
  }

  /**
   * Returns lock version
   * @param {String} lockAddress
   * @param {Number} network
   */
  async publicLockVersion(lockAddress: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    return await lockContract.publicLockVersion()
  }

  async tokenURI(lockAddress: string, tokenId: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    return await lockContract.tokenURI(tokenId)
  }
}
