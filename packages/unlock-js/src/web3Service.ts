import { ethers } from 'ethers'
import utils from './utils'
import UnlockService from './unlockService'
import {
  getErc20TokenSymbol,
  getErc20BalanceForAddress,
  getErc20Decimals,
} from './erc20'
import { ETHERS_MAX_UINT } from './constants'
import { TransactionOptions, WalletServiceCallback } from './types'
import { UniswapService } from './uniswapService'
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
  async getAddressBalance(
    address: string,
    network: number,
    tokenAddress?: string
  ) {
    if (!tokenAddress) {
      const balance = await this.providerForNetwork(network).getBalance(address)
      return utils.fromWei(balance, 'ether')
    } else {
      const balance = await getErc20BalanceForAddress(
        tokenAddress,
        address,
        this.providerForNetwork(network)
      )
      const decimals = await getErc20Decimals(
        tokenAddress,
        this.providerForNetwork(network)
      )
      return utils.fromDecimal(balance, decimals)
    }
  }

  /**
   * Refresh the lock's data.
   * We use the block version
   * @return Promise<Lock>
   */
  async getLock(address: string, network: number) {
    const networkConfig = this.networks[network]
    if (!(networkConfig && networkConfig.unlockAddress)) {
      throw new Error(
        'No unlock factory contract address found in the networks config.'
      )
    }

    const provider = this.providerForNetwork(network)

    const version = await this.lockContractAbiVersion(
      address,
      this.providerForNetwork(network)
    )

    const lock = await version.getLock.bind(this)(
      address,
      this.providerForNetwork(network)
    )
    // Add the lock address
    lock.address = address

    lock.unlockContractAddress = ethers.utils.getAddress(
      lock.unlockContractAddress
    )

    const previousDeployAddresses = (networkConfig.previousDeploys || []).map(
      (d) => ethers.utils.getAddress(d.unlockAddress)
    )
    const isPreviousUnlockContract = previousDeployAddresses.includes(
      lock.unlockContractAddress
    )

    const isUnlockContract =
      ethers.utils.getAddress(networkConfig.unlockAddress) ===
      lock.unlockContractAddress

    // Check that the Unlock address matches one of the configured ones
    if (!isUnlockContract && !isPreviousUnlockContract) {
      throw new Error(
        'This contract is not deployed from Unlock factory contract.'
      )
    }

    // Check that the Unlock contract has indeed deployed this lock
    const unlockContract = await this.getUnlockContract(
      lock.unlockContractAddress,
      provider
    )

    const response = await unlockContract.locks(address)

    if (!response.deployed) {
      throw new Error(
        'This contract is not deployed from Unlock factory contract.'
      )
    }

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

    const count = await version.totalKeys.bind(this)(
      lockAddress,
      owner,
      this.providerForNetwork(network)
    )

    return count.toNumber()
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

  /**
   * Returns the number of keys available for sale
   * @param lockAddress
   * @param network
   * @returns
   */
  async keysAvailable(lockAddress: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const totalSupply = await lockContract.totalSupply()
    const maxNumberOfKeys = await lockContract.maxNumberOfKeys()
    return maxNumberOfKeys.sub(totalSupply)
  }

  /**
   * Returns how much of a refund a key owner would receive
   * @param lockAddress
   * @param network
   * @param owner
   * @param tokenAddress
   * @param tokenId
   * @returns
   */
  async getCancelAndRefundValueFor(
    params: {
      lockAddress: string
      owner: string
      tokenAddress: string
      network: number
      tokenId: string
    },
    transactionOptions?: TransactionOptions,
    callback?: WalletServiceCallback
  ) {
    const { lockAddress, network } = params
    const version = await this.lockContractAbiVersion(
      lockAddress,
      this.providerForNetwork(network)
    )

    if (!version.getCancelAndRefundValueFor) {
      throw new Error('Lock version not supported')
    }

    return await version.getCancelAndRefundValueFor.bind(this)(
      params,
      transactionOptions,
      this.providerForNetwork(network)
    )
  }
  // For <= v10, it returns the total number of keys.
  // Starting with v11, it returns the total number of valid
  async balanceOf(lockAddress: string, owner: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const balance = await lockContract.balanceOf(owner)
    return balance.toNumber()
  }

  // Return key ID of owner at the specified index.
  // If a owner has multiple keys, you can iterate over all of them starting from 0 as index until you hit a zero value which implies no more.
  async tokenOfOwnerByIndex(
    lockAddress: string,
    owner: string,
    index: number,
    network: number
  ) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const id = await lockContract.tokenOfOwnerByIndex(owner, index)
    return id.toNumber()
  }

  /**
   * Returns the number of keys already sold
   * @param lockAddress
   * @param network
   * @returns
   */
  async totalSupply(lockAddress: string, network: number) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    return await lockContract.totalSupply()
  }

  /**
   * Returns the purchase price for the user on the lock
   */
  async purchasePriceFor({
    lockAddress,
    userAddress,
    data,
    referrer,
    network,
  }: {
    lockAddress: string
    network: number
    data: string
    userAddress: string
    referrer: string
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const price = await lockContract.purchasePriceFor(
      userAddress,
      referrer,
      data
    )
    return price
  }

  /**
   * Get uniswap price in the out token.
   * ```ts
   * const web3Service = new Web3Service(networks)
   * const price = await web3Service.consultUniswap({
   *  network: 1,
   *  tokenInAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
   *  tokenOutAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
   *  value: '1',
   * })
   *
   * console.log(price)
   * ```
   */
  async consultUniswap(options: {
    tokenInAddress: string
    tokenOutAddress?: string
    amount: string
    network?: number
  }) {
    const { network, tokenInAddress, amount } = options
    const networkId = network || 1
    const networkConfig = this.networks[networkId] // By default, use mainnet

    if (!networkConfig.uniswapV3) {
      throw new Error('No uniswap support on the network.')
    }

    const tokenOut = (networkConfig.tokens || []).find(
      // By default, use USDC on each network
      (item: any) => item.symbol === 'USDC'
    )

    let tokenOutAddress = options.tokenOutAddress

    // If no tokenOutAddress provided, use USDC address.
    if (!tokenOutAddress && tokenOut && tokenOut.address) {
      tokenOutAddress = tokenOut.address
    }

    if (!tokenOutAddress) {
      throw new Error('You need to provide a tokenOutAddress parameter. ')
    }

    const uniswapService = new UniswapService(this.networks)
    const price = await uniswapService.price({
      network,
      baseToken: tokenInAddress,
      quoteToken: tokenOutAddress,
      amount,
    })
    return price
  }

  /**
   * Returns freeTrialLength value
   */
  async freeTrialLength({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const freeTrialLength = await lockContract.freeTrialLength()
    return ethers.BigNumber.from(freeTrialLength).toNumber()
  }

  /**
   * Returns refundPenaltyBasisPoints value
   */
  async refundPenaltyBasisPoints({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const refundPenaltyBasisPoints =
      await lockContract.refundPenaltyBasisPoints()
    return ethers.BigNumber.from(refundPenaltyBasisPoints).toNumber()
  }

  /**
   * Returns onKeyCancelHook value
   */
  async onKeyCancelHook({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const address = await lockContract.onKeyCancelHook()
    return address
  }

  /**
   * Returns onKeyPurchaseHook value
   */
  async onKeyPurchaseHook({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const address = await lockContract.onKeyPurchaseHook()
    return address
  }

  /**
   * Returns onKeyTransferHook value
   */
  async onKeyTransferHook({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const address = await lockContract.onKeyTransferHook()
    return address
  }

  /**
   * Returns onTokenURIHook value
   */
  async onTokenURIHook({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const address = await lockContract.onTokenURIHook()
    return address
  }

  /**
   * Returns onValidKeyHook value
   */
  async onValidKeyHook({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const address = await lockContract.onValidKeyHook()
    return address
  }

  /**
   * Returns onKeyExtendHook value
   */
  async onKeyExtendHook({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const address = await lockContract.onKeyExtendHook()
    return address
  }

  /**
   * Returns onKeyGrantHook value
   */
  async onKeyGrantHook({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) {
    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const address = await lockContract.onKeyGrantHook()
    return address
  }
}
