import EventEmitter from 'events'
import Web3 from 'web3'
import Web3Utils from 'web3-utils'
/* eslint-disable import/no-unresolved */
import LockContract from '../artifacts/contracts/PublicLock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'
/* eslint-enable import/no-unresolved */
import configure from '../config'
import {
  MISSING_PROVIDER,
  NON_DEPLOYED_CONTRACT,
  NOT_ENABLED_IN_PROVIDER,
  FAILED_TO_CREATE_LOCK,
  FAILED_TO_PURCHASE_KEY,
  FAILED_TO_UPDATE_KEY_PRICE,
  FAILED_TO_WITHDRAW_FROM_LOCK,
} from '../errors'

export const keyId = (lock, owner) => [lock, owner].join('-')

/**
 * This service interacts with the user's wallet.
 * The functionality is on purpose only about sending transaction and returning the corresponding
 * hashes. Another service (which does not depend on the user;s wallet) will be in charge of
 * actually retrieving the data from the chain/smart contracts
 */
export default class WalletService extends EventEmitter {
  constructor({ providers, unlockAddress } = configure()) {
    super()
    if (unlockAddress) {
      this.unlockContractAddress = Web3Utils.toChecksumAddress(unlockAddress)
    }
    this.providers = providers
    this.ready = false
    this.providerName = null
    this.web3 = null

    this.on('ready', () => {
      this.ready = true
    })
  }

  /**
   * Expooses gas amount constants to be utilzed when sending relevant transactions
   * for the platform.
   */

  static gasAmountConstants() {
    return {
      createLock: 3000000,
      updateKeyPrice: 1000000,
      purchaseKey: 1000000,
      withdrawFromLock: 1000000,
    }
  }

  /**
   * This connects to the web3 service and listens to new blocks
   * @param {string} providerName
   * @return
   */
  async connect(providerName) {
    if (providerName === this.providerName) {
      // If the provider did not really change, no need to reset it
      return
    }

    // Keep track of the provider
    this.providerName = providerName
    // And reset the connection
    this.ready = false

    const provider = this.providers[providerName]

    // We fail: it appears that we are trying to connect but do not have a provider available...
    if (!provider) {
      return this.emit('error', new Error(MISSING_PROVIDER))
    }

    try {
      if (provider.enable) {
        // this exists for metamask and other modern dapp wallets and must be called,
        // see: https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
        await provider.enable()
      }
    } catch (error) {
      return this.emit('error', new Error(NOT_ENABLED_IN_PROVIDER))
    }

    this.web3 = new Web3(provider)

    const networkId = await this.web3.eth.net.getId()
    // unlockContractAddress is set in the constructor if config provides one in unlockAddress
    // this is set for staging and production
    if (!this.unlockContractAddress) {
      if (UnlockContract.networks[networkId]) {
        // If we do not have an address from config let's use the artifact files
        this.unlockContractAddress = Web3Utils.toChecksumAddress(
          UnlockContract.networks[networkId].address
        )
      } else {
        return this.emit('error', new Error(NON_DEPLOYED_CONTRACT))
      }
    }

    if (this.networkId !== networkId) {
      this.networkId = networkId
      this.emit('network.changed', networkId)
    }
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
  _sendTransaction({ to, from, data, value, gas }, callback) {
    const web3TransactionPromise = this.web3.eth.sendTransaction({
      to,
      from,
      value,
      data,
      gas,
    })

    this.emit('transaction.pending')

    return web3TransactionPromise
      .once('transactionHash', hash => {
        callback(null, hash)
        this.emit('transaction.new', hash, from, to, data)
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
  updateKeyPrice(lock, account, price) {
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lock)
    const data = lockContract.methods
      .updateKeyPrice(Web3Utils.toWei(price, 'ether'))
      .encodeABI()

    return this._sendTransaction(
      {
        to: lock,
        from: account,
        data,
        gas: WalletService.gasAmountConstants().updateKeyPrice,
        contract: LockContract,
      },
      error => {
        if (error) {
          return this.emit('error', new Error(FAILED_TO_UPDATE_KEY_PRICE))
        }
      }
    )
  }

  /**
   * Creates a lock on behalf of the user.
   * @param {PropTypes.lock} lock
   * @param {PropTypes.address} owner
   */
  createLock(lock, owner) {
    const unlock = new this.web3.eth.Contract(
      UnlockContract.abi,
      this.unlockContractAddress
    )

    const data = unlock.methods
      .createLock(
        lock.expirationDuration,
        Web3Utils.toWei(lock.keyPrice, 'ether'),
        lock.maxNumberOfKeys
      )
      .encodeABI()

    return this._sendTransaction(
      {
        to: this.unlockContractAddress,
        from: owner,
        data,
        gas: WalletService.gasAmountConstants().createLock,
        contract: UnlockContract,
      },
      (error, hash) => {
        if (error) {
          return this.emit('error', new Error(FAILED_TO_CREATE_LOCK))
        }
        // Let's update the lock to reflect that it is linked to this
        // This is an exception because, until we are able to determine the lock address
        // before the transaction is mined, we need to link the lock and transaction.
        return this.emit('lock.updated', lock.address, { transaction: hash })
      }
    )
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
\   */
  purchaseKey(lock, owner, keyPrice, account, data = '') {
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lock)
    const abi = lockContract.methods
      .purchaseFor(owner, Web3Utils.utf8ToHex(data || ''))
      .encodeABI()

    return this._sendTransaction(
      {
        to: lock,
        from: account,
        data: abi,
        gas: WalletService.gasAmountConstants().purchaseKey,
        value: Web3Utils.toWei(keyPrice, 'ether'),
        contract: LockContract,
      },
      error => {
        if (error) {
          return this.emit('error', new Error(FAILED_TO_PURCHASE_KEY))
        }
      }
    )
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {PropTypes.address} lock
   * @param {PropTypes.address} account
   * @param {Function} callback TODO: implement...
   */
  withdrawFromLock(lock, account) {
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lock)
    const data = lockContract.methods.withdraw().encodeABI()

    return this._sendTransaction(
      {
        to: lock,
        from: account,
        data,
        gas: WalletService.gasAmountConstants().withdrawFromLock,
        contract: LockContract,
      },
      error => {
        if (error) {
          return this.emit('error', new Error(FAILED_TO_WITHDRAW_FROM_LOCK))
        }
      }
    )
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
    const fallback = () => {
      this.web3.eth.sign(data, account, callback)
    }

    try {
      this.web3.eth.personal.sign(data, account, (error, signature) => {
        if (error) {
          return fallback()
        }
        return callback(error, signature)
      })
    } catch (error) {
      fallback()
    }
  }
}
