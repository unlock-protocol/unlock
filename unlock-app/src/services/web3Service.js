/* eslint no-console: 0 */  // TODO: remove me when this is clean

import Web3 from 'web3'
import Web3Utils from 'web3-utils'
import crypto from 'crypto'

import LockContract from '../artifacts/contracts/PublicLock.json'
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
        return reject(new Error('Provider does not exist'))
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
      }).catch(error => {
        console.error('Failed to retrive network id: ')
        console.error(error)
        return reject(error)
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
  createLock(lock, owner, callback) {
    return new Promise((resolve, reject) => {
      const unlock = new this.web3.eth.Contract(UnlockContract.abi, UnlockContract.networks[this.networkId].address)

      const data = unlock.methods.createLock(
        lock.expirationDuration,
        lock.keyPrice,
        lock.maxNumberOfKeys
      ).encodeABI()

      // The transaction object!
      const transaction = {
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
        lock: lock.id,
      }

      return this.sendTransaction({
        to: UnlockContract.networks[this.networkId].address,
        from: owner.address,
        data: data,
        gas: 2000000,
        privateKey: owner.privateKey,
        contractAbi: UnlockContract.abi,
      }, (error, { event, args }) => {
        if (error) {
          console.error(error)
        }
        if (event === 'transactionHash') {
          transaction.hash = args.hash
          transaction.status = 'submitted'
          lock.transaction = transaction.hash
          callback(transaction, lock)
        } else if (event === 'confirmation') {
          transaction.status = 'mined'
          transaction.confirmations += 1
          callback(transaction, lock)
        } else if (event === 'NewLock') {
          lock.address = args.newLockAddress
          return this.refreshLock(lock)
            .then((lock) => {
              callback(transaction, lock)
              return resolve(lock)
            })
        }
      }).catch((error) => {
        console.error(error)
        return reject(error)
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
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
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
        if (!blockTransaction) {
          // Missing transaction.
          return reject(new Error('Missing transaction'))
        }
        transaction.confirmations = blockNumber - blockTransaction.blockNumber
        return resolve(transaction)
      })
    })
  }

  /**
   * Refresh the lock's data
   * @return Promise<Lock>
   */
  refreshLock(lock) {
    return this.getLock(lock.address)
      .then((savedLock) => {
        lock = Object.assign(lock, savedLock)
        return lock
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

    const attributes = {
      keyPrice: (x) => x, // this is a BigNumber (represented as string)
      expirationDuration: parseInt,
      maxNumberOfKeys: parseInt,
      owner: (x) => x,
      outstandingKeys: parseInt,
    }

    const constantPromises = Object.keys(attributes).map((attribute) => {
      return contract.methods[attribute]().call().then((result) => {
        lock[attribute] = attributes[attribute](result) // We cast the value
        return lock
      })
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
  }

  /**
   * Purchase a key to a lock by account.
   * The key object is passed so we can kepe track of it from the application
   * The account object is required for its privateKey
   * The lock object is required to get the price data
   * @param {UnlockPropTypes.key} key
   * @param {UnlockPropTypes.account} account
   * @param {UnlockPropTypes.lock} lock
   * @param {PropTypes.func} callback
   * @return Promise<Key>
   */
  purchaseKey(key, account, lock, callback) {
    return new Promise((resolve) => {
      const lockContract = new this.web3.eth.Contract(LockContract.abi, key.lockAddress)
      const data = lockContract.methods.purchaseFor(key.owner, Web3Utils.utf8ToHex(key.data || '')).encodeABI()

      const transaction = {
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
        key: key.id,
      }
      callback(transaction, key)

      return this.sendTransaction({
        to: key.lockAddress,
        from: key.owner,
        data: data,
        gas: 1000000,
        value: lock.keyPrice,
        privateKey: account.privateKey,
        contractAbi: LockContract.abi,
      }, (error, { event, args }) => {
        if (error) {
          console.error(error)
        }
        if (event === 'transactionHash') {
          transaction.hash = args.hash
          key.transaction = transaction.hash
          transaction.status = 'submitted'
          callback(transaction, key)
        } else if (event === 'confirmation') {
          transaction.status = 'mined'
          transaction.confirmations += 1
          callback(transaction, key)
          return this.refreshKey(key).then((key) => {
            transaction.key = key
            callback(transaction, key)
            return resolve(key)
          })
        } else if (event === 'Transfer') {
          return this.refreshKey(key).then((key) => {
            transaction.key = key
            callback(transaction, key)
            return resolve(key)
          })
        }
      })
    })
  }

  /**
   * Returns the key to the lockAddress by the account.
   * @param {UnlockPropTypes.key} key
   * @return Promise<Key>
   */
  refreshKey(key) {
    if (!key.lockAddress) {
      return Promise.reject(new Error('Could not fetch key without a lock'))
    }
    const lockContract = new this.web3.eth.Contract(LockContract.abi, key.lockAddress)

    const getKeyExpirationPromise = lockContract.methods.keyExpirationTimestampFor(key.owner).call()
    const getKeyDataPromise = lockContract.methods.keyDataFor(key.owner).call()
    return Promise.all([getKeyExpirationPromise, getKeyDataPromise])
      .then(([expiration, data]) => {
        key.expiration = parseInt(expiration, 10)
        key.data = data
        return key
      }).catch((error) => {
        console.log(error)
        // We could not fetch the key. Assume it does not exist so set its expiration to 0
        key.expiration = 0
        key.data = null
        return key
      })
  }

  /**
   * Returns the key to the lockAddress by the account.
   * DEPRACTED: the objects are never created by this library but passed to it and synced against
   * against the smart contract. This function creates a key object and yields it, which is not ok.
   * @param {PropTypes.adress} lockAddress
   * @param {PropTypes.account} account
   * @return Promise<Key>
   */
  getKey(lockAddress, account) {
    if (!account || !lockAddress) {
      return Promise.reject(new Error('Could not fetch key without account and lock'))
    }

    const lockContract = new this.web3.eth.Contract(LockContract.abi, lockAddress)

    const getKeyExpirationPromise = lockContract.methods.keyExpirationTimestampFor(account.address).call()
    const getKeyDataPromise = lockContract.methods.keyDataFor(account.address).call()
    return Promise.all([getKeyExpirationPromise, getKeyDataPromise])
      .then(([expiration, data]) => {
        const key = {
          id: crypto.createHash('md5').update([lockAddress, account.address, expiration].join('')).digest('hex'),
          lockAddress,
          owner: account.address,
          expiration: parseInt(expiration, 10),
          data,
        }
        return key
      }).catch((error) => {
        console.log(error)
        // We could not fetch the key. Assume it does not exist?
        return Promise.reject(new Error('Missing key'))
      })
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {PropTypes.lock}
   * @param {PropTypes.account} account
   * @param {Function} callback TODO: implement...
   * @return Promise<lock>
  */
  withdrawFromLock(lock, account) {
    return new Promise((resolve) => {
      const lockContract = new this.web3.eth.Contract(LockContract.abi, lock.address)
      const data = lockContract.methods.withdraw().encodeABI()

      return this.sendTransaction({
        to: lock.address,
        from: account.address,
        data: data,
        gas: 1000000,
        privateKey: account.privateKey,
        contractAbi: LockContract.abi,
      }, (error, { event }) => {
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
