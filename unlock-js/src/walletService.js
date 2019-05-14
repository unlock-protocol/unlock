import Web3 from 'web3'
import { providers as ethersProviders } from 'ethers'
import UnlockService from './unlockService'
import { GAS_AMOUNTS } from './constants'
import * as utils from './utils.ethers'

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
   * This connects to the web3 service and listens to new blocks
   * @param {string} providerName
   * @return
   */
  async connect(provider) {
    // Reset the connection
    this.ready = false

    this.web3 = new Web3(provider)
    const networkId = await this.web3.eth.net.getId()

    if (this.networkId !== networkId) {
      this.networkId = networkId
      this.emit('network.changed', networkId)
    }
  }

  /**
   * Temporary function that allows us to use ethers functionality
   * without interfering with web3
   */
  async ethers_connect(provider) {
    // Reset the connection
    this.ready = false

    if (typeof provider === 'string') {
      this.provider = new ethersProviders.JsonRpcProvider(provider)
      this.web3Provider = false
    } else {
      this.provider = new ethersProviders.Web3Provider(provider)
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
      opCode = await this.web3.eth.getCode(this.unlockContractAddress)
    } catch (error) {
      return callback(error)
    }
    return callback(null, opCode !== '0x')
  }

  /**
   * Checks if the contract has been deployed at the address.
   * Invokes the callback with the result.
   * Addresses which do not have a contract attached will return 0x
   */
  async ethers_isUnlockContractDeployed(callback) {
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
    const accounts = await this.web3.eth.getAccounts()

    if (!accounts.length) {
      // We do not have an account, can't do anything until we have one.
      return (this.ready = false)
    }

    let address = accounts[0]

    this.emit('account.changed', address)
    this.emit('ready')
    return Promise.resolve(address)
  }

  /**
   * Function which yields the address of the account on the provider
   */
  async ethers_getAccount() {
    const accounts = await this.provider.listAccounts()

    if (!accounts.length) {
      // We do not have an account, can't do anything until we have one.
      return (this.ready = false)
    }

    let address = accounts[0]

    this.emit('account.changed', address)
    this.emit('ready')
    return Promise.resolve(address)
  }

  /**
   * This function submits a web3 transaction and will trigger an event as soon as it receives its
   * hash. We then use the web3Service to handle the ongoing transaction (watch for confirmation
   * receipt... etc)
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
    return transaction.hash
    // errors fall through
  }

  /**
   * This function submits a web3Transaction and will trigger an event as soon as it receives its
   * hash. We then use the web3Service to handle the ongoing transaction (watch for conformation
   * receipt... etc)
   * @private
   */
  _sendTransaction({ to, from, data, value, gas }, transactionType, callback) {
    const web3TransactionPromise = this.web3.eth.sendTransaction({
      to,
      from,
      value,
      data,
      gas,
    })

    this.emit('transaction.pending', transactionType)

    return web3TransactionPromise
      .once('transactionHash', hash => {
        callback(null, hash)
        // TODO: consider an object instead of all the fields independently.
        this.emit(
          'transaction.new',
          hash,
          from,
          to,
          data,
          transactionType,
          'submitted'
        )
      })
      .on('error', error => {
        callback(error)
      })
  }

  /**
   *
   * @param {PropTypes.address} lock : address of the lock for which we update the price
   * @param {PropTypes.address} account: account who owns the lock
   * @param {string} price : new price for the lock
   */
  async updateKeyPrice(lock, account, price) {
    const version = await this.lockContractAbiVersion(lock)
    return version.updateKeyPrice.bind(this)(lock, account, price)
  }

  /**
   *
   * @param {PropTypes.address} lock : address of the lock for which we update the price
   * @param {PropTypes.address} account: account who owns the lock
   * @param {string} price : new price for the lock
   */
  async ethers_updateKeyPrice(lock, account, price) {
    const version = await this.ethers_lockContractAbiVersion(lock)
    return version.ethers_updateKeyPrice.bind(this)(lock, account, price)
  }

  /**
   * Creates a lock on behalf of the user.
   * @param {PropTypes.lock} lock
   * @param {PropTypes.address} owner
   */
  async createLock(lock, owner) {
    const version = await this.unlockContractAbiVersion()
    return version.createLock.bind(this)(lock, owner)
  }

  /**
   * Creates a lock on behalf of the user.
   * @param {PropTypes.lock} lock
   * @param {PropTypes.address} owner
   */
  async ethers_createLock(lock, owner) {
    const version = await this.ethers_unlockContractAbiVersion()
    return version.ethers_createLock.bind(this)(lock, owner)
  }

  /**
   * Purchase a key to a lock by account.
   * The key object is passed so we can kepe track of it from the application
   * The lock object is required to get the price data
   * We pass both the owner and the account because at some point, these may be different (someone
   * purchases a key for someone else)
   * @param {PropTypes.address} lock
   * @param {PropTypes.address} owner
   * @param {string} keyPrice
   * @param {string} data
   * @param {string} account
   */
  async purchaseKey(lock, owner, keyPrice, account, data = '') {
    const version = await this.lockContractAbiVersion(lock)
    return version.purchaseKey.bind(this)(lock, owner, keyPrice, account, data)
  }

  /**
   * Purchase a key to a lock by account.
   * The key object is passed so we can kepe track of it from the application
   * The lock object is required to get the price data
   * We pass both the owner and the account because at some point, these may be different (someone
   * purchases a key for someone else)
   * @param {PropTypes.address} lock
   * @param {PropTypes.address} owner
   * @param {string} keyPrice
   * @param {string} data
   * @param {string} account
   */
  async ethers_purchaseKey(lock, owner, keyPrice, account, data = '') {
    const version = await this.ethers_lockContractAbiVersion(lock)
    return version.ethers_purchaseKey.bind(this)(
      lock,
      owner,
      keyPrice,
      account,
      data
    )
  }

  /**
   * Triggers a transaction to withdraw some funds from the lock and assign them
   * to the owner.
   * @param {PropTypes.address} lock
   * @param {PropTypes.address} account
   * @param {string} ethAmount
   * @param {Function} callback
   */
  async partialWithdrawFromLock(lock, account, ethAmount, callback) {
    const version = await this.lockContractAbiVersion(lock)
    return version.partialWithdrawFromLock.bind(this)(
      lock,
      account,
      ethAmount,
      callback
    )
  }

  /**
   * Triggers a transaction to withdraw some funds from the lock and assign them
   * to the owner.
   * @param {PropTypes.address} lock
   * @param {PropTypes.address} account
   * @param {string} ethAmount
   * @param {Function} callback
   */
  async ethers_partialWithdrawFromLock(lock, account, ethAmount, callback) {
    const version = await this.ethers_lockContractAbiVersion(lock)
    return version.ethers_partialWithdrawFromLock.bind(this)(
      lock,
      account,
      ethAmount,
      callback
    )
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {PropTypes.address} lock
   * @param {PropTypes.address} account
   * @param {Function} callback TODO: implement...
   */
  async withdrawFromLock(lock, account) {
    const version = await this.lockContractAbiVersion(lock)
    return version.withdrawFromLock.bind(this)(lock, account)
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {PropTypes.address} lock
   * @param {PropTypes.address} account
   * @param {Function} callback TODO: implement...
   */
  async ethers_withdrawFromLock(lock, account) {
    const version = await this.ethers_lockContractAbiVersion(lock)
    return version.ethers_withdrawFromLock.bind(this)(lock, account)
  }

  /**
   * Signs data for the given account.
   * We favor web3.eth.personal.sign which provides a better UI but is not implemented
   * everywhere. If it's failing we use web3.eth.sign
   *
   * @param {*} account
   * @param {*} data
   * @param {*} callback
   */
  signData(account, data, callback) {
    let method

    if (this.web3.currentProvider.isMetaMask) {
      method = 'eth_signTypedData_v3'
      data = JSON.stringify(data)
    } else {
      method = 'eth_signTypedData'
    }

    return this.web3.currentProvider.send(
      {
        method: method,
        params: [account, data],
        from: account,
      },
      (err, result) => {
        // network failure
        if (err) {
          return callback(err, null)
        }

        // signature failure on the node
        if (result.error) {
          return callback(result.error, null)
        }

        callback(null, Buffer.from(result.result).toString('base64'))
      }
    )
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
  async ethers_signData(account, data, callback) {
    let method

    if (this.web3Provider && this.web3Provider.isMetaMask) {
      method = 'eth_signTypedData_v3'
      data = JSON.stringify(data)
    } else {
      method = 'eth_signTypedData'
    }

    try {
      const result = await this.provider.send(method, [account, data])

      // signature failure on the node
      if (result.error) {
        return callback(result.error, null)
      }

      callback(null, Buffer.from(result.result).toString('base64'))
    } catch (err) {
      return callback(err, null)
    }
  }

  async signDataPersonal(account, data, callback) {
    try {
      let signature

      if (this.web3.currentProvider.constructor.name == 'HttpProvider') {
        signature = await this.web3.eth.sign(data, account)
      } else {
        signature = await this.web3.eth.personal.sign(data, account)
      }

      callback(null, Buffer.from(signature).toString('base64'))
    } catch (error) {
      return callback(error, null)
    }
  }

  async ethers_signDataPersonal(account, data, callback) {
    try {
      const dataHash = utils.sha3(utils.utf8ToHex(data))
      const signer = this.provider.getSigner()
      const addr = await signer.getAddress()
      const signature = await this.provider.send('personal_sign', [
        utils.hexlify(dataHash),
        addr.toLowerCase(),
      ])

      callback(null, Buffer.from(signature).toString('base64'))
    } catch (error) {
      return callback(error, null)
    }
  }

  async recoverAccountFromSignedData(data, signedData, callback) {
    const address = await this.web3.eth.personal.ecRecover(data, signedData)
    callback(null, address)
  }
}
