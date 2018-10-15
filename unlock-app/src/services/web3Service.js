/* eslint no-console: 0 */  // TODO: remove me when this is clean

import Web3 from 'web3'
import Web3Utils from 'web3-utils'

import LockContract from '../artifacts/contracts/Lock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'
import configure from '../config'

const { providers } = configure(global)

/**
 * This service interacts with the web3 RPC endpoint.
 * All the methods return promises.
 * Some methods (createLock, withdrawFromLock, purchaseKey) are performing transactions. They return a promise but also accept a callback which lets the user 'listen' to changes on the pending transaction
 *
 */
export default class Web3Service {

  /**
   * This connects to the web3 service and listens to new blocks
   * TODO consider pulling the account logic away from that method into the promise listener
   * @param {object} network
   * @return {Promise}
   */
  connect({ provider, network }) {
    this.ready = false

    return new Promise((resolve, reject) => {

      // We fail: it appears that we are trying to connect but do not have a provider available...
      if (!providers[provider]) {
        return reject()
      }

      this.web3 = new Web3(providers[provider])

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
        this.ready = true
        return resolve([networkId, account])
      })
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
    return sentTransaction.once('transactionHash', (hash) => {
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
   * This returns a promise of lock, but also accepts a callback to monitor the transaction
   * @param {PropTypes.lock} lock
   * @param {function} callback
   * @return Promise<Lock>
   */
  createLock(newLock, callback) {
    return new Promise((resolve, reject) => {
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
      callback(transaction)

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
          callback(transaction)
        } else if (event === 'confirmation') {
          transaction.status = 'mined'
          transaction.confirmations += 1
          callback(transaction)
        } else if (event === 'NewLock') {
          return this.getLock(args.newLockAddress).then((lock) => {
            lock.name = newLock.name // This isn't stored on-chain so we need to add it here
            transaction.lock = lock
            callback(transaction)
            return resolve(lock)
          })
        }
      })
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
          return account
        })
    })
  }

  /**
   * This refreshes a transaction by its hash
   * @param {Transaction} transaction
   * @return Promise<Transaction>
   */
  refreshTransaction(transaction) {
    return new Promise((resolve, reject) => {
      return Promise.all([
        this.web3.eth.getBlockNumber(),
        this.web3.eth.getTransaction(transaction.hash),
      ]).then(([blockNumber, blockTransaction]) => {
        transaction.confirmations = blockNumber - blockTransaction.blockNumber
        return resolve(transaction)
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
              return lock
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

    // Let's load its balance
    constantPromises.push(this.getAddressBalance(address).then((balance) => {
      lock.balance = balance
      return lock
    }))

    // Once lock has been refreshed
    return Promise.all(constantPromises).then(() => {
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
   * @return Promise<Key>
   */
  purchaseKey(lockAddress, account, keyPrice, keyData, callback) {
    return new Promise((resolve, reject) => {
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
      callback(transaction)

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
          callback(transaction)
        } else if (event === 'confirmation') {
          transaction.status = 'mined'
          transaction.confirmations += 1
          callback(transaction)
          return this.getKey(lockAddress, account).then((key) => {
            transaction.key = key
            callback(transaction)
            return resolve(key)
          })
        } else if (event === 'Transfer') {
          return this.getKey(lockAddress, account).then((key) => {
            transaction.key = key
            callback(transaction)
            return resolve(key)
          })
        }
      })
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
        return key
      })
      .catch(() => {
        // TODO: be smarter about that error!
        const key = {
          expiration: 0,
        }
        return key
      })
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {PropTypes.lock}
   * @param {PropTypes.account} account
   * @param {Function} callback TODO: implement...
   * @return Promise<lock>
  */
  withdrawFromLock(lock, account, callback) {
    return new Promise((resolve, reject) => {
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
          return resolve(lock)
        }
      })
    })

  }

}
