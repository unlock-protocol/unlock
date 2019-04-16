import Web3 from 'web3'
import UnlockService from './unlockService'
import { GAS_AMOUNTS } from './constants'

/**
 * This service interacts with the user's wallet.
 * The functionality is on purpose only about sending transaction and returning the corresponding
 * hashes. Another service (which does not depend on the user;s wallet) will be in charge of
 * actually retrieving the data from the chain/smart contracts
 */
export default class WalletService extends UnlockService {
  constructor({ unlockAddress }) {
    super({ unlockAddress })
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
   * Function which yields the address of the account on the provider or creates a key pair.
   */
  async getAccount(createIfNone = false) {
    const accounts = await this.web3.eth.getAccounts()
    let address

    if (!accounts.length && !createIfNone) {
      // We do not have an account and were not asked to create one!
      // Not sure how that could happen?
      return (this.ready = false)
    }

    if (accounts.length) {
      address = accounts[0] // We have an account.
    } else if (createIfNone) {
      let newAccount = await this.web3.eth.accounts.create()
      address = newAccount.address
    }

    this.emit('account.changed', address)
    this.emit('ready')
    return Promise.resolve(address)
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
    const version = await this.lockContractAbiVersion()
    return version.updateKeyPrice.bind(this)(lock, account, price)
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
    const version = await this.lockContractAbiVersion()
    return version.purchaseKey.bind(this)(lock, owner, keyPrice, account, data)
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
    const version = await this.lockContractAbiVersion()
    return version.partialWithdrawFromLock.bind(this)(
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
    const version = await this.lockContractAbiVersion()
    return version.withdrawFromLock.bind(this)(lock, account)
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
}
