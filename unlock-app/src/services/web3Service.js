/* eslint no-console: 0 */  // TODO: remove me when this is clean

import Web3 from 'web3'
import Web3Utils from 'web3-utils'
import { networks } from '../config'

import LockContract from '../artifacts/contracts/Lock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'

import { setAccount, resetAccountBalance } from '../actions/accounts'
import { setLock, resetLock } from '../actions/lock'
import { setKey } from '../actions/key'
import { setTransaction, updateTransaction } from '../actions/transaction'

export default class Web3Service {

  constructor(_dispatch) {
    this.dispatch = _dispatch
  }

  /**
   * This connects to the web3 service and listens to new blocks
   * @param {object} network
   * @return {Promise}
   */
  connect({ network }) {
    const conf = networks[network.name]

    if (!conf.provider) {
      if (conf.protocol === 'ws') {
        conf.provider = new Web3.providers.WebsocketProvider(conf.url)
      } else if (conf.protocol === 'http') {
        conf.provider = new Web3.providers.HttpProvider(conf.url)
      }
    }
    this.web3 = new Web3(conf.provider)

    // Get the network id
    const getNetworkIdPromise = this.web3.eth.net.getId()

    let getAccountPromise
    if (!network.account.address) {
      getAccountPromise = this.web3.eth.getAccounts().then((accounts) => {
        if (accounts.length === 0) {
          return this.createAccount() // TODO: make it a promise which returns an account!
        } else {
          return Promise.resolve({
            address: accounts[0], // take the first one by default
          })
        }
      })
    } else {
      getAccountPromise = Promise.resolve(network.account)
    }

    // Once we have the account, let's refresh it!
    const refreshAccountPromise = getAccountPromise.then((account) => {
      return this.getAddressBalance(account.address).then((balance) => {
        account.balance = balance
        return account
      })
    })

    return Promise.all([
      refreshAccountPromise,
      getNetworkIdPromise,
    ]).then(([account, networkId]) => {
      this.networkId = networkId
      this.dispatch(setAccount(account))
      return account
    })
  }

  /**
   * This helper function signs a transaction
   * and sends it.
   * @private
   */
  sendTransaction({ to, from, data, value, gas, privateKey, contractAbi = [] }, callback) {

    // Home made event handling since this is not handled correctly by web3 :/
    const abiEvents = contractAbi.filter((item) => {
      return item.type === 'event'
    })

    if (!privateKey) {
      // We are using a third party provider so we do not have a privateKey for the user...
      // We assume this will support sendTransaction
      const sentTransactionPromise = this.web3.eth.sendTransaction({ to, from, value, data, gas })
      return this.handleTransaction(sentTransactionPromise, abiEvents, callback)
    } else {
      // We process transactions ourselves...
      // Sign first
      return this.web3.eth.accounts.signTransaction({ to, from, value, data, gas }, privateKey)
        .then((signedTransaction) => {
          const sentSignedTransactionPromise = this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
          return this.handleTransaction(sentSignedTransactionPromise, abiEvents, callback)
        })
    }
  }

  /**
   * @private
   * @param {*} sentTransaction
   * @param {*} abiEvents
   * @param {*} callback
   */
  handleTransaction(sentTransaction, abiEvents, callback) {
    sentTransaction.once('transactionHash', (hash) => {
      callback(null, { event: 'transactionHash', args: { hash } })
    }).on('confirmation', (confirmationNumber, receipt) => {
      callback(null, { event: 'confirmation', args: { confirmationNumber, receipt } })
    }).once('receipt', (receipt) => {
      callback(null, { event: 'receipt', args: { receipt } })
      receipt.logs.forEach((log) => {
        // For each event, let's look at the inputs
        abiEvents.forEach((event) => {
          let topics = log.topics
          if (event.name) {
            // https://web3js.readthedocs.io/en/1.0/web3-eth-abi.html#decodelog
            // topics - Array: An array with the index parameter topics of the log, without the topic[0] if its a non-anonymous event, otherwise with topic[0].
            topics = log.topics.slice(1)
          }
          const decoded = this.web3.eth.abi.decodeLog(event.inputs, log.data, topics)
          const args = event.inputs.reduce((args, input) => {
            args[input.name] = decoded[input.name]
            return args
          }, {})
          callback(null, { event: event.name, args })
        })
      })
    }).on('error', (error) => {
      callback(error, {})
    })
  }

  /**
   * Creates a lock on behalf of the user `from`.
   * @param {PropTypes.lock} lock
   */
  createLock(newLock) {
    const unlock = new this.web3.eth.Contract(UnlockContract.abi, UnlockContract.networks[this.networkId].address)

    const data = unlock.methods.createLock(
      newLock.keyReleaseMechanism,
      newLock.expirationDuration,
      newLock.keyPrice,
      newLock.maxNumberOfKeys
    ).encodeABI()

    // The transaction object!
    const transaction = {
      status: 'pending',
      confirmations: 0,
      createdAt: new Date().getTime(),
    }
    this.dispatch(setTransaction(transaction))

    return this.sendTransaction({
      to: UnlockContract.networks[this.networkId].address,
      from: newLock.creator.address,
      data: data,
      gas: 1500000,
      privateKey: newLock.creator.privateKey,
      contractAbi: UnlockContract.abi,
    }, (error, { event, args }) => {
      if (error) {
        console.error(error)
      }
      if (event === 'transactionHash') {
        transaction.hash = args.hash
        transaction.status = 'submitted'
        this.dispatch(updateTransaction(transaction))
      } else if (event === 'confirmation') {
        transaction.status = 'mined'
        transaction.confirmations += 1
        this.dispatch(updateTransaction(transaction))
      } else if (event === 'NewLock') {
        return this.getLock(args.newLockAddress).then((lock) => {
          transaction.lock = lock
          this.getAddressBalance(newLock.creator.address).then((balance) => {
            this.dispatch(resetAccountBalance(balance))
          })
          this.dispatch(updateTransaction(transaction))
        })
      }
    })
  }

  /**
   * This loads the account's balance
   * Returns a promise with the balance
   */
  getAddressBalance(address) {
    return this.web3.eth.getBalance(address)
  }

  /**
   * This loads the account matching the private key
   * @param {string} privateKey
   * @return Promise<Account>
   */
  loadAccount(privateKey) {
    return new Promise((resolve, reject) => {
      return resolve(this.web3.eth.accounts.privateKeyToAccount(privateKey))
    }).then((account) => {
      return this.getAddressBalance(account.address)
        .then((balance) => {
          account.balance = balance
          this.dispatch(setAccount(account))
          return account
        })
    })
  }

  /**
   * This creates an account on the current network.
   * @return Promise<Account>
   */
  createAccount() {
    return new Promise((resolve, reject) => {
      return resolve(this.web3.eth.accounts.create())
    }).then((account) => {
      // We poll the balance even though it is certainly 0
      return this.getAddressBalance(account.address)
        .then((balance) => {
          account.balance = balance
          this.dispatch(setAccount(account))
          return account
        })
    })
  }

  /**
   * This gets the lock object from the stored data in the blockchain
   * @param {PropTypes.adress} address
   * @return Promise<Lock>
   */
  getLock(address) {
    let lock = {
      address,
      balance: '0',
    }

    const contract = new this.web3.eth.Contract(LockContract.abi, address)

    const constantPromises = []

    LockContract.abi.forEach((item) => {
      if (item.constant) {
        if (item.inputs.length === 0) {
          if (!lock[item.name]) {
            const promise = contract.methods[item.name]().call().then((result) => {
              lock[item.name] = result
            })
            constantPromises.push(promise)
          }
          lock[item.name] = undefined
        } else {
          lock[item.name] = (...args) => {
            const promise = new Promise((resolve, reject) => {
              contract.methods[item.name](...args).call((error, result) => {
                if (error) {
                  // Something happened
                  return reject(error)
                } else {
                  return resolve(result)
                }
              })
            })
            return promise
          }
        }
      }
    })

    // Lock object is ready, but with missing data
    this.dispatch(setLock(lock))

    // Let's load its balance
    constantPromises.push(this.getAddressBalance(address).then((balance) => {
      lock.balance = balance
    }))

    // Once lock has been refreshed
    return Promise.all(constantPromises).then(() => {
      this.dispatch(resetLock(lock)) // update the lock
      return lock
    })

    // TODO: methods, events, changes?
  }

  /**
   * Purchase a key to a lock by account.
   * @param {PropTypes.adress} lockAddress
   * @param {PropTypes.account} account
   * @param {PropTypes.number} keyPrice
   * @param {PropTypes.string} keyData // This needs to maybe be less strict. (binary data)
   * @return Promise<Key> (TODO: not really)
   */
  purchaseKey(lockAddress, account, keyPrice, keyData) {
    const lock = new this.web3.eth.Contract(LockContract.abi, lockAddress)
    const data = lock.methods.purchaseFor(account.address, Web3Utils.utf8ToHex(keyData)).encodeABI()

    // The transaction object (conflict if other transactions have not been confirmed yet?)
    // TODO: We have a race condition because this will keep emitting even after
    // confirmation... which is a problem if we trigger other transaction
    const transaction = {
      status: 'pending',
      confirmations: 0,
      createdAt: new Date().getTime(),
    }
    this.dispatch(setTransaction(transaction))

    return this.sendTransaction({
      to: lockAddress,
      from: account.address,
      data: data,
      gas: 1000000,
      value: keyPrice,
      privateKey: account.privateKey,
      contractAbi: LockContract.abi,
    }, (error, { event, args }) => {
      if (error) {
        console.error(error)
      }
      if (event === 'transactionHash') {
        transaction.hash = args.hash
        transaction.status = 'submitted'
        this.dispatch(updateTransaction(transaction))
      } else if (event === 'confirmation') {
        transaction.status = 'mined'
        transaction.confirmations += 1
        this.dispatch(updateTransaction(transaction))
        const getKey = this.getKey(lockAddress, account)
        const updateBalance = this.getAddressBalance(account.address)
        return Promise.all([getKey, updateBalance]).then((key, balance) => {
          transaction.key = key
          this.dispatch(updateTransaction(transaction))
          this.dispatch(resetAccountBalance(balance))
        })
      } else if (event === 'Transfer') {
        // Take this into account as well.
        this.dispatch(updateTransaction(transaction))
        const getKey = this.getKey(lockAddress, account)
        const updateBalance = this.getAddressBalance(account.address)
        return Promise.all([getKey, updateBalance]).then(([key, balance]) => {
          transaction.key = key
          this.dispatch(updateTransaction(transaction))
          this.dispatch(resetAccountBalance(balance))
          return key
        })
      }
    })
  }

  /**
   * Returns the key to the lockAddress by the account.
   * @param {PropTypes.adress} lockAddress
   * @param {PropTypes.account} account
   * @return Promise<Key>
   */
  getKey(lockAddress, account) {
    if (!account || !lockAddress) {
      const key = {
        expiration: 0,
      }
      this.dispatch(setKey(key))
      return Promise.resolve(key)
    }
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lockAddress)

    const getKeyExpirationPromise = lockContract.methods.keyExpirationTimestampFor(account.address).call()
    const getKeyDataPromise = lockContract.methods.keyDataFor(account.address).call()
    return Promise.all([getKeyExpirationPromise, getKeyDataPromise])
      .then(([expiration, data]) => {
        const key = {
          expiration: parseInt(expiration, 10),
          data,
        }
        this.dispatch(setKey(key))
        return key
      })
      .catch(() => {
        // TODO: be smarter about that error!
        const key = {
          expiration: 0,
        }
        this.dispatch(setKey(key))
        return key
      })
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {PropTypes.lock}
   * @param {PropTypes.account} account
  */
  withdrawFromLock(lock, account) {
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lock.address)
    const data = lockContract.methods.withdraw().encodeABI()

    return this.sendTransaction({
      to: lock.address,
      from: account.address,
      data: data,
      gas: 1000000,
      privateKey: account.privateKey,
      contractAbi: LockContract.abi,
    }, (error, { event, args }) => {
      if (error) {
        console.error(error)
      }
      if (event === 'receipt') {
        return Promise.all([
          this.getAddressBalance(account.address),
          this.getAddressBalance(lock.address),
        ]).then(([accountBalance, lockBalance]) => {
          account.balance = accountBalance
          this.dispatch(resetAccountBalance(accountBalance))
          lock.balance = lockBalance
          this.dispatch(resetLock(lock))
          return Promise.all([lock, account])
        })
      }
    })
  }

}
