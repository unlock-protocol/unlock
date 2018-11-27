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
    this.eventsHandlers = {
      NewLock: (transaction, args) => {
        return this.emit(
          'lock.saved',
          {
            transaction: transaction.hash,
            address: transaction.lock,
          },
          args.newLockAddress
        )
      },
    }
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

        this.unlockContractAddress = Web3Utils.toChecksumAddress(
          UnlockContract.networks[networkId].address
        )
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
    transaction,
    { to, from, data, value, gas, contractAbi = [] },
    callback
  ) {
    const web3TransactionPromise = this.web3.eth.sendTransaction({
      to,
      from,
      value,
      data,
      gas,
    })
    return this.handleTransaction(
      transaction,
      web3TransactionPromise,
      contractAbi,
      callback
    )
  }

  /**
   * This function submits a web3Transaction and will trigger events as it is being processed,
   * as well as invoke the callback for functions which may need to know about specific events.
   * @private
   * @param {*} transaction
   * @param {*} web3TransactionPromise
   * @param {*} contractAbi
   * @param {*} callback
   */
  handleTransaction(
    transaction,
    web3TransactionPromise,
    contractAbi,
    callback
  ) {
    return web3TransactionPromise
      .once('transactionHash', hash => {
        transaction.hash = hash
        transaction.status = 'submitted'
        callback(null, { event: 'transactionHash', args: { hash } })
        this.emit('transaction.new', transaction)
      })
      .on('confirmation', confirmationNumber => {
        this.emit('transaction.updated', transaction, {
          status: 'mined',
          confirmations: confirmationNumber,
        })
      })
      .once('receipt', receipt => {
        callback(null, { event: 'receipt', args: { receipt } })
        // Should we invoke this only when we have received enough confirmations?
        // That would be safer... but also add a lot of latency.
        this.parseTransactionLogsFromReceipt(transaction, contractAbi, receipt)
      })
      .on('error', error => {
        this.emit('error', error)
        callback(error)
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
      lock: lock.address,
    }

    return this.sendTransaction(
      transaction,
      {
        to: this.unlockContractAddress,
        from: owner.address,
        data: data,
        gas: 2000000,
        contractAbi: UnlockContract.abi,
      },
      (error, { event, args } = {}) => {
        if (event === 'transactionHash') {
          this.emit('lock.updated', lock, { transaction: args.hash })
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
   * This function will trigger events based on smart contract events
   * @private
   * @param {*} name
   * @param {*} params
   */
  emitContractEvent(transaction, name, params) {
    const handler = this.eventsHandlers[name]
    if (handler) {
      return handler(transaction, params)
    }
  }

  /**
   * Given a transaction receipt and the abi for a contract, parses and trigger the
   * corresponding events
   * @param {*} transaction
   * @param {*} contractAbi
   * @param {*} transactionReceipt
   */
  parseTransactionLogsFromReceipt(
    transaction,
    contractAbi,
    transactionReceipt
  ) {
    transactionReceipt.logs.forEach(log => {
      // Home made event handling since this is not handled correctly by web3 :/
      const abiEvents = contractAbi.filter(item => {
        return item.type === 'event'
      })

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
        this.emitContractEvent(transaction, event.name, args)
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

      if (blockTransaction.transactionIndex === null) {
        // This means the transaction is not in a block yet (ie. not mined)
        return this.emit('transaction.updated', transaction, {
          status: 'pending',
          confirmations: 0,
        })
      }

      // The transaction was mined
      this.emit('transaction.updated', transaction, {
        status: 'mined',
        confirmations: blockNumber - blockTransaction.blockNumber,
      })

      // Let's check its receipt to see if it triggered any event!
      return this.web3.eth
        .getTransactionReceipt(transaction.hash)
        .then(transactionReceipt => {
          if (!transactionReceipt.status) {
            return this.emit('transaction.updated', transaction, {
              status: 'failed',
            })
          }

          if (
            this.unlockContractAddress ===
            Web3Utils.toChecksumAddress(blockTransaction.to)
          ) {
            return this.parseTransactionLogsFromReceipt(
              transaction,
              UnlockContract.abi,
              transactionReceipt
            )
          }

          return this.parseTransactionLogsFromReceipt(
            transaction,
            LockContract.abi,
            transactionReceipt
          )
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
      lock: lock.address,
      account: account.address,
    }

    return this.sendTransaction(
      transaction,
      {
        to: key.lockAddress,
        from: key.owner,
        data: data,
        gas: 1000000,
        value: lock.keyPrice,
        contractAbi: LockContract.abi,
      },
      (error, { event } = {}) => {
        if (event === 'transactionHash') {
          this.emit('key.updated', key, {
            transaction: transaction.hash,
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
      lock: lock.address,
      account: account.address,
    }

    this.sendTransaction(
      transaction,
      {
        to: lock.address,
        from: account.address,
        data: data,
        gas: 1000000,
        contractAbi: LockContract.abi,
      },
      (error, { event } = {}) => {
        if (event === 'receipt') {
          return this.getLock(lock)
        }
      }
    )
  }
}
