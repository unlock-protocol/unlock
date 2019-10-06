import { ethers } from 'ethers'
import UnlockService from './unlockService'
import FetchJsonProvider from './FetchJsonProvider'
import { GAS_AMOUNTS } from './constants'
import utils from './utils'

/**
 * This service interacts with the user's wallet.
 * The functionality is on purpose only about sending transaction and returning the corresponding
 * hashes. Another service (which does not depend on the user;s wallet) will be in charge of
 * actually retrieving the data from the chain/smart contracts
 */
export default class WalletService extends UnlockService {
  constructor({ unlockAddress }) {
    super({ unlockAddress, writable: true })
    this.ready = false

    this.on('ready', () => {
      this.ready = true
    })
  }

  /**
   * Exposes gas amount constants to be utilzed when sending relevant transactions
   * for the platform.
   */
  static gasAmountConstants() {
    return GAS_AMOUNTS
  }

  /**
   * Temporary function that allows us to use ethers functionality
   * without interfering with web3
   */
  async connect(provider) {
    // Reset the connection
    this.ready = false

    if (typeof provider === 'string') {
      this.provider = new FetchJsonProvider(provider)
      this.web3Provider = false
    } else if (provider.isUnlock) {
      // TODO: This is very temporary! Immediate priority is to refactor away
      // various special cases for provider instantiation, since having 3
      // distinct kinds of provider isn't the Right Thing.
      this.provider = provider
      // TODO: In particular, we want to avoid caring about whether a provider
      // is MetaMask or any other specific one. We want to support a single
      // common kernel of capability, even if that means MetaMask experience
      // will be somewhat degraded.
      this.web3Provider = false
    } else {
      this.provider = new ethers.providers.Web3Provider(provider)
      this.web3Provider = provider
    }
    const { chainId: networkId } = await this.provider.getNetwork()

    if (this.networkId !== networkId) {
      this.networkId = networkId
      this.emit('network.changed', networkId)
    }
  }

  /**
   * Checks if the contract has been deployed at the address.
   * Invokes the callback with the result.
   * Addresses which do not have a contract attached will return 0x
   */
  async isUnlockContractDeployed(callback) {
    let opCode = '0x' // Default
    try {
      opCode = await this.provider.getCode(this.unlockContractAddress)
    } catch (error) {
      return callback(error)
    }
    return callback(null, opCode !== '0x')
  }

  /**
   * Function which yields the address of the account on the provider
   */
  async getAccount() {
    const accounts = await this.provider.listAccounts()

    if (!accounts.length) {
      // We do not have an account, can't do anything until we have one.
      return (this.ready = false)
    }

    let address = accounts[0]

    this.emit('account.changed', address)
    if (this.provider.emailAddress) {
      this.emit('account.updated', { emailAddress: this.provider.emailAddress })
    }
    this.emit('ready')
    return Promise.resolve(address)
  }

  /**
   * This function submits a web3 transaction and will trigger an event as soon as it receives its
   * hash. We then use the web3Service to handle the ongoing transaction (watch for confirmation
   * receipt... etc)
   * A the moment the dispatcher relies on the strict emission, it is imperitive that the emission
   * of these fields not change for the time being!
   * @private
   * @param {Promise} the result of calling a contract method (ethersjs contract)
   * @param {string} the Unlock protocol transaction type
   * @param {Function} a standard node callback that accepts the transaction hash
   */
  async _handleMethodCall(methodCall, transactionType) {
    this.emit('transaction.pending', transactionType)
    const transaction = await methodCall
    this.emit(
      'transaction.new',
      transaction.hash,
      transaction.from,
      transaction.to,
      transaction.data,
      transactionType,
      'submitted'
    )
    const finalTransaction = await transaction.wait() // TODO: why do we wait here? This should return instantly: getting a hash should not require i/o
    return finalTransaction.hash
    // errors fall through
  }

  /**
   * Updates the key price on a lock
   * @param {PropTypes.address} lockAddress : address of the lock for which we update the price
   * @param {string} price : new price for the lock
   */
  async updateKeyPrice(params = {}) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.updateKeyPrice.bind(this)(params)
  }

  /**
   * Creates a lock on behalf of the user.
   * @param {PropTypes.lock} lock
   * @return Promise<PropTypes.address> lockAddress
   */
  async createLock(lock) {
    const version = await this.unlockContractAbiVersion()
    return version.createLock.bind(this)(lock)
  }

  /**
   * Purchase a key to a lock by account.
   * The key object is passed so we can keep track of it from the application
   * TODO: retrieve the keyPrice, erc20Address from chain when applicablle
   * - {PropTypes.address} lockAddress
   * - {PropTypes.address} owner
   * - {string} keyPrice
   * - {string} data
   * - {PropTypes.address} erc20Address
   * - {number} decimals
   */
  async purchaseKey(params = {}) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.purchaseKey.bind(this)(params)
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {object} params
   * - {PropTypes.address} lockAddress
   * - {string} amount
   */
  async withdrawFromLock(params = {}) {
    if (!params.lockAddress) throw new Error('Missing lockAddress')
    const version = await this.lockContractAbiVersion(params.lockAddress)
    return version.withdrawFromLock.bind(this)(params)
  }

  /**
   * Signs data for the given account.
   * We favor eth_signTypedData which provides a better UI
   * In Metamask, it is called eth_signTypedData_v3
   *
   * @param {*} account
   * @param {*} data
   * @param {*} callback
   */
  async signData(account, data, callback) {
    const isMetaMask = this.web3Provider && this.web3Provider.isMetaMask
    const method = isMetaMask ? 'eth_signTypedData_v3' : 'eth_signTypedData'
    // see https://github.com/MetaMask/metamask-extension/blob/c4caba131776ff7397d3a4071d7cc84907ac9a43/app/scripts/metamask-controller.js#L997
    const sendData = isMetaMask ? JSON.stringify(data) : data

    try {
      const result = await this.provider.send(method, [account, sendData])

      callback(null, Buffer.from(result).toString('base64'))
    } catch (err) {
      return callback(err, null)
    }
  }

  async signMessage(data, method) {
    const dataHash = utils.utf8ToHex(data)
    const signer = this.provider.getSigner()
    const addr = await signer.getAddress()
    let firstParam = dataHash
    let secondParam = addr.toLowerCase()
    if (method === 'eth_sign') {
      ;[firstParam, secondParam] = [secondParam, firstParam] // swap the parameter order
    }
    return await this.provider.send(method, [firstParam, secondParam])
  }

  async signDataPersonal(account, data, callback) {
    try {
      const method = this.web3Provider ? 'personal_sign' : 'eth_sign'
      const signature = await this.signMessage(data, method)
      callback(null, Buffer.from(signature).toString('base64'))
    } catch (error) {
      return callback(error, null)
    }
  }
}
