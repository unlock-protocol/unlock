import EventEmitter from 'events'
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
 * Some methods (createLock, withdrawFromLock, purchaseKey) are performing transactions. They return
 * a promise but also accept a callback which lets the user 'listen' to changes on the pending
 * transaction Web3Service is an event emitter and will trigger events which can be handled by
 * upstream objects.
 */
export default class Web3Service extends EventEmitter {
  constructor() {
    super()
    this.ready = false
    this.provider = null
    this.web3 = null
  }

  /**
   * This connects to the web3 service and listens to new blocks
   * @param {object} account
   * @return
   */
  connect({ provider }) {
    if (provider === this.provider) {
      // If the provider did not really change, no need to reset it
      return
    }

    // Keep track of the provider
    this.provider = provider
    // And reset the connection
    this.ready = false

    // We fail: it appears that we are trying to connect but do not have a provider available...
    if (!providers[provider]) {
      return this.emit('error', new Error('Provider does not exist'))
    }

    this.web3 = new Web3(providers[provider])

    return this.web3.eth.net
      .getId()
      .then(networkId => {
        if (!UnlockContract.networks[networkId]) {
          return this.emit(
            'error',
            new Error(`Unlock is not deployed on network ${networkId}`)
          )
        }

        this.unlockContractAddress = UnlockContract.networks[networkId].address
        this.ready = true
        if (this.networkId !== networkId) {
          this.networkId = networkId
          this.emit('network.changed', networkId)
        }
      })
      .catch(error => {
        this.emit('error', error)
      })
  }

  /**
   * Function which refreshes the account supplied or loads one from the local node or creates
   * one.
   * @param {*} account
   */
  refreshOrGetAccount(account) {
    let getAccountPromise
    if (!account || !account.address) {
      getAccountPromise = this.web3.eth.getAccounts().then(accounts => {
        if (accounts.length === 0) {
          return this.createAccount()
        } else {
          return Promise.resolve({
            address: accounts[0], // take the first one by default
          })
        }
      })
    } else {
      getAccountPromise = Promise.resolve(account)
    }

    // Once we have the account, let's refresh it!
    return getAccountPromise.then(account => {
      return this.getAddressBalance(account.address).then(balance => {
        account.balance = balance
        this.emit('account.changed', account)
        return account
      })
    })
  }

  /**
   * This helper function signs a transaction
   * and sends it.
   * @private
   */
  sendTransaction(
    { to, from, data, value, gas, privateKey, contractAbi = [] },
    callback
  ) {
    // Home made event handling since this is not handled correctly by web3 :/
    const abiEvents = contractAbi.filter(item => {
      return item.type === 'event'
    })

    if (!privateKey) {
      // We are using a third party provider so we do not have a privateKey for the user...
      // We assume this will support sendTransaction
      const sentTransactionPromise = this.web3.eth.sendTransaction({
        to,
        from,
        value,
        data,
        gas,
      })
      return this.handleTransaction(sentTransactionPromise, abiEvents, callback)
    } else {
      // We process transactions ourselves...
      // Sign first
      return this.web3.eth.accounts
        .signTransaction({ to, from, value, data, gas }, privateKey)
        .then(signedTransaction => {
          const sentSignedTransactionPromise = this.web3.eth.sendSignedTransaction(
            signedTransaction.rawTransaction
          )
          return this.handleTransaction(
            sentSignedTransactionPromise,
            abiEvents,
            callback
          )
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
    return sentTransaction
      .once('transactionHash', hash => {
        callback(null, { event: 'transactionHash', args: { hash } })
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        callback(null, {
          event: 'confirmation',
          args: { confirmationNumber, receipt },
        })
      })
      .once('receipt', receipt => {
        callback(null, { event: 'receipt', args: { receipt } })
        receipt.logs.forEach(log => {
          // For each event, let's look at the inputs
          abiEvents.forEach(event => {
            let topics = log.topics
            if (event.name) {
              // https://web3js.readthedocs.io/en/1.0/web3-eth-abi.html#decodelog
              // topics - Array: An array with the index parameter topics of the log, without the topic[0] if its a non-anonymous event, otherwise with topic[0].
              topics = log.topics.slice(1)
            }
            const decoded = this.web3.eth.abi.decodeLog(
              event.inputs,
              log.data,
              topics
            )
            const args = event.inputs.reduce((args, input) => {
              args[input.name] = decoded[input.name]
              return args
            }, {})
            callback(null, { event: event.name, args })
          })
        })
      })
      .on('error', error => {
        callback(error, {})
      })
  }

  /**
   * Creates a lock on behalf of the user `from`.
   * @param {PropTypes.lock} lock
   */
  createLock(lock, owner) {
    const unlock = new this.web3.eth.Contract(
      UnlockContract.abi,
      this.unlockContractAddress
    )

    const data = unlock.methods
      .createLock(lock.expirationDuration, lock.keyPrice, lock.maxNumberOfKeys)
      .encodeABI()

    // The transaction object!
    const transaction = {
      status: 'pending',
      confirmations: 0,
      createdAt: new Date().getTime(),
      lock: lock.id,
    }

    return this.sendTransaction(
      {
        to: this.unlockContractAddress,
        from: owner.address,
        data: data,
        gas: 2000000,
        contractAbi: UnlockContract.abi,
      },
      (error, { event, args } = {}) => {
        if (error) {
          this.emit('error', error)
        }
        if (event === 'transactionHash') {
          transaction.hash = args.hash
          transaction.status = 'submitted'
          this.emit('transaction.new', transaction)
          this.emit('lock.updated', lock, { transaction: transaction.hash })
        } else if (event === 'confirmation') {
          this.emit('transaction.updated', transaction, {
            status: 'mined',
            confirmations: args.confirmationNumber,
          })
        } else if (event === 'NewLock') {
          return this.emit('lock.saved', lock, args.newLockAddress)
        }
      }
    )
  }

  /**
   * This loads the account's balance
   * Returns a promise with the balance
   */
  getAddressBalance(address) {
    return this.web3.eth.getBalance(address).catch(error => {
      this.emit('error', error)
    })
  }

  /**
   * This creates an account on the current network.
   * @return Promise<Account>
   */
  createAccount() {
    return new Promise(resolve => {
      return resolve(this.web3.eth.accounts.create())
    }).then(account => {
      // We poll the balance even though it is certainly 0
      return this.getAddressBalance(account.address).then(balance => {
        account.balance = balance
        return account
      })
    })
  }

  /**
   * This refreshes a transaction by its hash
   * @param {Transaction} transaction
   */
  getTransaction(transaction) {
    Promise.all([
      this.web3.eth.getBlockNumber(),
      this.web3.eth.getTransaction(transaction.hash),
    ]).then(([blockNumber, blockTransaction]) => {
      if (!blockTransaction) {
        return this.emit('error', new Error('Missing transaction'))
      }
      this.emit('transaction.updated', transaction, {
        confirmations: blockNumber - blockTransaction.blockNumber,
      })
    })
  }

  /**
   * Refresh the lock's data
   * @return Promise<Lock>
   */
  getLock(lock) {
    const contract = new this.web3.eth.Contract(LockContract.abi, lock.address)

    const attributes = {
      keyPrice: x => x, // this is a BigNumber (represented as string)
      expirationDuration: parseInt,
      maxNumberOfKeys: parseInt,
      owner: x => x,
      outstandingKeys: parseInt,
    }

    const update = {}

    const constantPromises = Object.keys(attributes).map(attribute => {
      return contract.methods[attribute]()
        .call()
        .then(result => {
          update[attribute] = attributes[attribute](result) // We cast the value
        })
    })

    // Let's load its balance
    constantPromises.push(
      this.getAddressBalance(lock.address).then(balance => {
        update.balance = balance
      })
    )

    // Once lock has been refreshed
    return Promise.all(constantPromises).then(() => {
      this.emit('lock.updated', lock, update)
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
   */
  purchaseKey(key, account, lock) {
    const lockContract = new this.web3.eth.Contract(
      LockContract.abi,
      key.lockAddress
    )
    const data = lockContract.methods
      .purchaseFor(key.owner, Web3Utils.utf8ToHex(key.data || ''))
      .encodeABI()

    const transaction = {
      status: 'pending',
      confirmations: 0,
      createdAt: new Date().getTime(),
      key: key.id,
      lock: lock.id,
      account: account.address,
    }

    return this.sendTransaction(
      {
        to: key.lockAddress,
        from: key.owner,
        data: data,
        gas: 1000000,
        value: lock.keyPrice,
        contractAbi: LockContract.abi,
      },
      (error, { event, args } = {}) => {
        if (error) {
          return this.emit('error', error)
        }
        if (event === 'transactionHash') {
          transaction.hash = args.hash
          transaction.status = 'submitted'
          this.emit('transaction.new', transaction)
          this.emit('key.updated', key, {
            transaction: transaction.hash,
          })
        } else if (event === 'confirmation') {
          this.emit('transaction.updated', transaction, {
            status: 'mined',
            confirmations: args.confirmationNumber,
          })
        } else if (event === 'Transfer') {
          this.getKey(key)
          return this.emit('key.saved', key)
        }
      }
    )
  }

  /**
   * Returns the key to the lockAddress by the account.
   * @param {UnlockPropTypes.key} key
   */
  getKey(key) {
    if (!key.lockAddress) {
      return this.emit('key.updated', key, {
        expiration: 0,
        data: null,
      })
    }
    const update = {}

    const lockContract = new this.web3.eth.Contract(
      LockContract.abi,
      key.lockAddress
    )

    const getKeyExpirationPromise = lockContract.methods
      .keyExpirationTimestampFor(key.owner)
      .call()
    const getKeyDataPromise = lockContract.methods.keyDataFor(key.owner).call()
    if (!key.id) {
      update.id = crypto
        .createHash('md5')
        .update([key.lockAddress, key.owner].join(''))
        .digest('hex')
    }
    Promise.all([getKeyExpirationPromise, getKeyDataPromise])
      .then(([expiration, data]) => {
        update.expiration = parseInt(expiration, 10)
        update.data = data
        this.emit('key.updated', key, update)
      })
      .catch(() => {
        update.expiration = 0
        update.data = null
        this.emit('key.updated', key, update)
      })
  }

  /**
   * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
   * @param {PropTypes.lock}
   * @param {PropTypes.account} account
   * @param {Function} callback TODO: implement...
   */
  withdrawFromLock(lock, account) {
    const lockContract = new this.web3.eth.Contract(
      LockContract.abi,
      lock.address
    )
    const data = lockContract.methods.withdraw().encodeABI()

    const transaction = {
      status: 'pending',
      confirmations: 0,
      createdAt: new Date().getTime(),
      lock: lock.id,
      account: account.address,
    }

    this.sendTransaction(
      {
        to: lock.address,
        from: account.address,
        data: data,
        gas: 1000000,
        contractAbi: LockContract.abi,
      },
      (error, { event, args } = {}) => {
        if (error) {
          return this.emit('error', error)
        }
        if (event === 'transactionHash') {
          transaction.hash = args.hash
          transaction.status = 'submitted'
          this.emit('transaction.new', transaction)
        } else if (event === 'confirmation') {
          this.emit('transaction.updated', transaction, {
            status: 'mined',
            confirmations: args.confirmationNumber,
          })
        } else if (event === 'receipt') {
          return this.getLock(lock)
        }
      }
    )
  }
}
