import EventEmitter from 'events'
import Web3 from 'web3'
import Web3Utils from 'web3-utils'

import LockContract from '../artifacts/contracts/PublicLock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'
import configure from '../config'
import { TRANSACTION_TYPES } from '../constants'

const { providers } = configure()

export const keyId = (lock, owner) => [lock, owner].join('-')

/**
 * This service interacts with the web3 RPC endpoint.
 * All the methods return promises.
 * Some methods (createLock, withdrawFromLock, purchaseKey) are performing transactions. They return
 * a promise but also accept a callback which lets the user 'listen' to changes on the pending
 * transaction Web3Service is an event emitter and will trigger events which can be handled by
 * upstream objects.
 */
export default class Web3Service extends EventEmitter {
  // Note: This dependency injection is necessary for these tests:
  //
  // describe('request enabling access to account',...
  // describe('fail while enabling access to account',...
  //
  // In the tests, we add an "enable" mock in order to test the code in connect (below)
  // where we "await provider.enable()" to support privacy measures in metamask and other
  // wallets
  //
  // This will be removed when Web3Service is refactored
  constructor(availableProviders = providers) {
    super()
    this.providers = availableProviders
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
      Transfer: ({ lock, owner }) => {
        return this.emit('key.saved', keyId(lock, owner), {
          lock,
          owner,
        })
      },
    }

    this.on('ready', () => {
      this.ready = true
    })
  }

  /**
   * This connects to the web3 service and listens to new blocks
   * @param {object} account
   * @return
   */
  async connect({ provider: providerName }) {
    if (providerName === this.provider) {
      // If the provider did not really change, no need to reset it
      return
    }

    // Keep track of the provider
    this.provider = providerName
    // And reset the connection
    this.ready = false

    // We fail: it appears that we are trying to connect but do not have a provider available...
    const provider = this.providers[providerName]
    if (!provider) {
      return this.emit('error', new Error('Provider does not exist'))
    }

    try {
      if (provider.enable) {
        // this exists for metamask and other modern dapp wallets and must be called,
        // see: https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
        await provider.enable()
      }
    } catch (error) {
      this.emit(
        'error',
        new Error('User canceled access to ethereum wallet, cannot continue')
      )
    }

    try {
      this.web3 = new Web3(provider)

      const networkId = await this.web3.eth.net.getId()
      if (!UnlockContract.networks[networkId]) {
        throw new Error(`Unlock is not deployed on network ${networkId}`)
      }

      this.unlockContractAddress = Web3Utils.toChecksumAddress(
        UnlockContract.networks[networkId].address
      )
      if (this.networkId !== networkId) {
        this.networkId = networkId
        this.emit('network.changed', networkId)
      }
    } catch (error) {
      this.emit('error', error)
    }
  }

  /**
   * Refreshed the balance of the account
   * @param {*} account
   */
  refreshAccountBalance(account) {
    return this.getAddressBalance(account.address).then(balance => {
      this.emit('account.updated', account, {
        balance,
      })
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
        this.emit('ready')

        return account
      })
    })
  }

  /**
   * The method sets the transaction's type, based on the data being sent.
   * TODO: match also based on Contract type. There could be conflicts in names
   * @param {*} transaction
   * @param {*} data
   */
  getTransactionType(contractAbi, data) {
    const method = contractAbi.find(binaryInterface => {
      return data.startsWith(binaryInterface.signature)
    })

    if (method.name === 'createLock') {
      return TRANSACTION_TYPES.LOCK_CREATION
    }

    if (method.name === 'purchaseFor') {
      return TRANSACTION_TYPES.KEY_PURCHASE
    }

    if (method.name === 'withdraw') {
      return TRANSACTION_TYPES.WITHDRAW
    }

    // Unknown transaction
    return null
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

    transaction.type = this.getTransactionType(contractAbi, data)

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
   * This function is able to retrieve past transaction sent by a user to the Unlock smart contract
   * if they triggered events
   * This is helpful because it means we can recover state for a given user from the chain
   * @param {*} address
   */
  getPastUnlockTransactionsForUser(address) {
    const unlock = new this.web3.eth.Contract(
      UnlockContract.abi,
      this.unlockContractAddress
    )
    unlock.getPastEvents(
      'NewLock',
      {
        fromBlock: 0, // TODO start only when the smart contract was deployed?
        toBlock: 'latest',
        filter: {
          lockOwner: address,
        },
      },
      (error, events = []) => {
        events.forEach(event => {
          const transaction = {
            hash: event.transactionHash,
          }
          this.emit('transaction.new', transaction)
          this.getTransaction(transaction)
        })
      }
    )
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
      lock: lock.address, // This is likely a temporary address
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
          // We update the transaction, still using the temporary address
          this.emit('lock.updated', lock.address, { transaction: args.hash })
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
    // Home made event handling since this is not handled correctly by web3 :/
    const abiEvents = contractAbi.filter(item => {
      return item.type === 'event'
    })

    transactionReceipt.logs.forEach(log => {
      // For each log, let's find which event it is
      abiEvents.forEach(event => {
        const encodedEvent = this.web3.eth.abi.encodeEventSignature(event)
        let topics = log.topics

        if (encodedEvent !== topics[0]) return

        const decoded = this.web3.eth.abi.decodeLog(
          event.inputs,
          log.data,
          log.topics.slice(1)
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
   * This refreshes a transaction by its hash.
   * It will only process the transaction if the filter function returns true
   * @param {Transaction} transaction
   * @param {Function} filter
   */
  getTransaction(transaction) {
    Promise.all([
      this.web3.eth.getBlockNumber(),
      this.web3.eth.getTransaction(transaction.hash),
    ]).then(([blockNumber, blockTransaction]) => {
      if (!blockTransaction) {
        return this.emit('error', new Error('Missing transaction'))
      }

      const contractAbi =
        this.unlockContractAddress ===
        Web3Utils.toChecksumAddress(blockTransaction.to)
          ? UnlockContract.abi
          : LockContract.abi

      const transactionType = this.getTransactionType(
        contractAbi,
        blockTransaction.input
      )

      if (blockTransaction.transactionIndex === null) {
        // This means the transaction is not in a block yet (ie. not mined)
        return this.emit('transaction.updated', transaction, {
          status: 'pending',
          type: transactionType,
          confirmations: 0,
        })
      }

      // The transaction was mined
      this.emit('transaction.updated', transaction, {
        status: 'mined',
        type: transactionType,
        confirmations: blockNumber - blockTransaction.blockNumber,
      })

      // Let's check its receipt to see if it triggered any event!
      return this.web3.eth
        .getTransactionReceipt(transaction.hash)
        .then(transactionReceipt => {
          // NOTE: old version of web3.js (pre 1.0.0-beta.34) are not parsing 0x0 into a falsy value
          if (
            !transactionReceipt.status ||
            transactionReceipt.status == '0x0'
          ) {
            return this.emit('transaction.updated', transaction, {
              status: 'failed',
            })
          }

          return this.parseTransactionLogsFromReceipt(
            transaction,
            contractAbi,
            transactionReceipt
          )
        })
    })
  }

  /**
   * Refresh the lock's data
   * @return Promise<Lock>
   */
  getLock(address) {
    const contract = new this.web3.eth.Contract(LockContract.abi, address)

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
      this.getAddressBalance(address).then(balance => {
        update.balance = balance
      })
    )

    // Once lock has been refreshed
    return Promise.all(constantPromises).then(() => {
      this.emit('lock.updated', address, update)
      return update
    })
  }

  /**
   * Purchase a key to a lock by account.
   * The key object is passed so we can kepe track of it from the application
   * The lock object is required to get the price data
   * We pass both the owner and the account because at some point, these may be different (someone
   * purchases a key for someone else)
   * @param {string} lock
   * @param {string} owner
   * @param {string} keyPrice
   * @param {string} data
   * @param {UnlockPropTypes.account} account
   */
  purchaseKey(lock, owner, keyPrice, account, data = '') {
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lock)
    const abi = lockContract.methods
      .purchaseFor(owner, Web3Utils.utf8ToHex(data || ''))
      .encodeABI()

    const transaction = {
      status: 'pending',
      confirmations: 0,
      createdAt: new Date().getTime(),
      key: keyId(lock, owner),
      lock: lock,
      owner,
    }

    return this.sendTransaction(
      transaction,
      {
        to: lock,
        from: account.address,
        data: abi,
        gas: 1000000,
        value: keyPrice,
        contractAbi: LockContract.abi,
      },
      (error, { event, args } = {}) => {
        if (event === 'transactionHash') {
          this.emit('key.updated', keyId(lock, owner), {
            lock,
            owner,
            transaction: args.hash,
          })
        }
      }
    )
  }

  /**
   * Returns the key to the lock by the account.
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   */
  getKeyByLockForOwner(lock, owner) {
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lock)
    return this._getKeyByLockForOwner(lockContract, owner).then(
      ([expiration, data]) => {
        this.emit('key.updated', keyId(lock, owner), {
          lock,
          owner,
          expiration,
          data,
        })
      }
    )
  }

  /**
   * Returns the key to the lock by the account.
   * @private
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   * @return Promise<>
   */
  _getKeyByLockForOwner(lockContract, owner) {
    return new Promise(resolve => {
      const getKeyExpirationPromise = lockContract.methods
        .keyExpirationTimestampFor(owner)
        .call()
      const getKeyDataPromise = lockContract.methods.keyDataFor(owner).call()

      Promise.all([getKeyExpirationPromise, getKeyDataPromise])
        .then(([expiration, data]) => {
          return resolve([parseInt(expiration, 10), data])
        })
        .catch(() => {
          return resolve([0, null])
        })
    })
  }

  /**
   * This loads and returns the keys for a lock per page
   * This function is performing quite badly because it retrieves n owners one by one
   * and then gets their keys. We need to implement functions on the smart contract
   * to make that better.
   * @param {PropTypes.string}
   * @param {PropTypes.integer}
   * @param {PropTypes.integer}
   */
  getKeysForLockOnPage(lock, page, byPage) {
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lock)

    const startIndex = page * byPage
    const keyPromises = Array.from(Array(byPage).keys()).map(n => {
      return lockContract.methods
        .owners(n + startIndex)
        .call()
        .then(ownerAddress => {
          return this._getKeyByLockForOwner(lockContract, ownerAddress)
        })
    })
    return Promise.all(keyPromises).then(keys => {
      this.emit('keys.page', lock, page, keys)
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
      withdrawal: lock.address,
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
          return this.getLock(lock.address)
        }
      }
    )
  }
}
