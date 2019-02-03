import EventEmitter from 'events'
import Web3 from 'web3'
import Web3Utils from 'web3-utils'

import LockContract from '../artifacts/contracts/PublicLock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'
import configure from '../config'
import { TRANSACTION_TYPES, MAX_UINT } from '../constants'
import { NON_DEPLOYED_CONTRACT } from '../errors'

const {
  readOnlyProvider,
  providers,
  unlockAddress,
  blockTime,
  requiredNetworkId,
  requiredConfirmations,
} = configure()

export const keyId = (lock, owner) => [lock, owner].join('-')

/**
 * This service reads data from the RPC endpoint.
 * All transactions should be sent via the WalletService.
 */
export default class Web3Service extends EventEmitter {
  constructor(unlockContractAddress = unlockAddress) {
    super()

    if (readOnlyProvider) {
      this.web3 = new Web3(readOnlyProvider)
    } else {
      this.web3 = new Web3(Object.values(providers)[0]) // Defaulting to the first provider.
    }

    // TODO: detect discrepancy in providers

    // Transactions create events which we use here to build the state.
    this.eventsHandlers = {
      NewLock: (transactionHash, contractAddress, blockNumber, args) => {
        this.emit('transaction.updated', transactionHash, {
          lock: contractAddress,
        })
        this.emit('lock.updated', args.newLockAddress, {
          asOf: blockNumber,
          transaction: transactionHash,
          address: args.newLockAddress,
        })
        return this.getLock(args.newLockAddress)
      },
      Transfer: (transactionHash, contractAddress, blockNumber, args) => {
        const owner = args._to
        this.emit('transaction.updated', transactionHash, {
          key: keyId(contractAddress, owner),
        })
        return this.emit('key.saved', keyId(contractAddress, owner), {
          lock: contractAddress,
          owner,
        })
      },
      PriceChanged: (
        transactionHash,
        contractAddress,
        blockNumber,
        { keyPrice }
      ) => {
        this.emit('transaction.updated', transactionHash, {
          lock: contractAddress,
        })
        return this.emit('lock.updated', contractAddress, {
          asOf: blockNumber,
          keyPrice: Web3Utils.fromWei(keyPrice, 'ether'),
        })
      },
      Withdrawal: (transactionHash, contractAddress) => {
        // TODO: update the lock balance too!
        this.emit('transaction.updated', transactionHash, {
          lock: contractAddress,
        })
      },
    }
    if (unlockContractAddress) {
      this.unlockContractAddress = Web3Utils.toChecksumAddress(
        unlockContractAddress
      )
    } else if (UnlockContract.networks[requiredNetworkId]) {
      // If we do not have an address from config let's use the artifact files
      this.unlockContractAddress = Web3Utils.toChecksumAddress(
        UnlockContract.networks[requiredNetworkId].address
      )
    } else {
      return this.emit('error', new Error(NON_DEPLOYED_CONTRACT))
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
   * The method sets the transaction's type, based on the data being sent.
   * @param {*} contract
   * @param {*} data
   */
  getTransactionType(contract, data) {
    const method = contract.abi.find(binaryInterface => {
      return data.startsWith(binaryInterface.signature)
    })

    if (contract.contractName === 'Unlock' && method.name === 'createLock') {
      return TRANSACTION_TYPES.LOCK_CREATION
    }

    if (
      contract.contractName === 'PublicLock' &&
      method.name === 'purchaseFor'
    ) {
      return TRANSACTION_TYPES.KEY_PURCHASE
    }

    if (contract.contractName === 'PublicLock' && method.name === 'withdraw') {
      return TRANSACTION_TYPES.WITHDRAWAL
    }

    if (
      contract.contractName === 'PublicLock' &&
      method.name === 'updateKeyPrice'
    ) {
      return TRANSACTION_TYPES.UPDATE_KEY_PRICE
    }

    // Unknown transaction
    return null
  }

  /**
   * This function retrieves past transactions from events on a given contract
   * @param {*} contract
   * @param {*} events
   * @param {*} filter
   * @private
   */
  _getPastTransactionsForContract(contract, eventNames, filter) {
    return contract.getPastEvents(
      eventNames,
      {
        fromBlock: 0, // TODO start only when the smart contract was deployed?
        toBlock: 'latest',
        filter,
      },
      (error, events = []) => {
        events.forEach(event => {
          this.emit('transaction.new', event.transactionHash)
        })
      }
    )
  }

  /**
   * This function is able to retrieve past transaction sent by a user to the Unlock smart contract
   * to create a new Lock.
   * @param {*} address
   */
  getPastLockCreationsTransactionsForUser(address) {
    const unlock = new this.web3.eth.Contract(
      UnlockContract.abi,
      this.unlockContractAddress
    )
    return this._getPastTransactionsForContract(unlock, 'NewLock', {
      lockOwner: address,
    })
  }

  /**
   * This function is able to retrieve the past transaction on a lock as long as these transactions
   * triggered events.
   * @param {*} lockAddress
   */
  getPastLockTransactions(lockAddress) {
    const lockContract = new this.web3.eth.Contract(
      LockContract.abi,
      lockAddress
    )
    return this._getPastTransactionsForContract(lockContract, 'allevents')
  }

  /**
   * This retrieves the balance of an address (contract or account)
   * and formats it to a string of ether.
   * Returns a promise with the balance
   */
  getAddressBalance(address) {
    return this.web3.eth
      .getBalance(address)
      .then(balance => {
        return Web3Utils.fromWei(balance, 'ether')
      })
      .catch(error => {
        this.emit('error', error)
      })
  }

  /**
   * This function will trigger events based on smart contract events
   * @private
   * @param {string} transactionHash
   * @param {string} contractAddress
   * @param {string} blockNumber
   * @param {string} name
   * @param {object} params
   */
  emitContractEvent(
    transactionHash,
    contractAddress,
    blockNumber,
    name,
    params
  ) {
    const handler = this.eventsHandlers[name]
    if (handler) {
      return handler(transactionHash, contractAddress, blockNumber, params)
    }
  }

  /**
   * Given a transaction receipt and the abi for a contract, parses and trigger the
   * corresponding events
   * @param {*} transactionHash
   * @param {*} contract
   * @param {*} transactionReceipt
   */
  parseTransactionLogsFromReceipt(
    transactionHash,
    contract,
    transactionReceipt
  ) {
    // Home made event handling since this is not handled correctly by web3 :/
    const abiEvents = contract.abi.filter(item => {
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

        this.emitContractEvent(
          transactionHash,
          log.address,
          transactionReceipt.blockNumber,
          event.name,
          args
        )
      })
    })
  }

  /**
   * This will set a timeout to get a transaction after half a block time happened
   * @param {string} transactionHash
   */
  _watchTransaction(transactionHash) {
    setTimeout(() => {
      this.getTransaction(transactionHash)
    }, blockTime / 2)
  }

  /**
   * This refreshes a transaction by its hash.
   * It will only process the transaction if the filter function returns true
   * @param {string} transactionHash
   * @param {Function} filter
   */
  getTransaction(transactionHash) {
    Promise.all([
      this.web3.eth.getBlockNumber(),
      this.web3.eth.getTransaction(transactionHash),
    ]).then(([blockNumber, blockTransaction]) => {
      if (!blockTransaction) {
        // The transaction is still pending: it has been sent to the network but not
        // necessarily received by the node we're asking it (and not mined...)
        // TODO: This presents a UI challenge because we currently do not show anything to the
        // user that a transaction exists and is pending... (since we have nothing to link it to)
        // Hopefully though this should be fairly short lived because the transaction should be propagated
        // to all nodes fairly quickly
        this._watchTransaction(transactionHash)
        return this.emit('transaction.updated', transactionHash, {
          status: 'submitted',
          confirmations: 0,
          blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
        })
      }

      const contract =
        this.unlockContractAddress ===
        Web3Utils.toChecksumAddress(blockTransaction.to)
          ? UnlockContract
          : LockContract

      const transactionType = this.getTransactionType(
        contract,
        blockTransaction.input
      )

      if (blockTransaction.blockNumber === null) {
        // This means the transaction is not in a block yet (ie. not mined), but has been propagated
        this._watchTransaction(transactionHash)
        return this.emit('transaction.updated', transactionHash, {
          status: 'pending',
          type: transactionType,
          confirmations: 0,
          blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
        })
      }

      // Let's watch for more confirmations if needed
      if (blockNumber - blockTransaction.blockNumber < requiredConfirmations) {
        this._watchTransaction(transactionHash)
      }

      // The transaction was mined, so we have a receipt for it
      this.emit('transaction.updated', transactionHash, {
        status: 'mined',
        type: transactionType,
        confirmations: blockNumber - blockTransaction.blockNumber,
        blockNumber: blockTransaction.blockNumber,
      })

      return this.web3.eth
        .getTransactionReceipt(transactionHash)
        .then(transactionReceipt => {
          if (transactionReceipt) {
            // NOTE: old version of web3.js (pre 1.0.0-beta.34) are not parsing 0x0 into a falsy value
            if (
              !transactionReceipt.status ||
              transactionReceipt.status == '0x0'
            ) {
              return this.emit('transaction.updated', transactionHash, {
                status: 'failed',
              })
            }

            return this.parseTransactionLogsFromReceipt(
              transactionHash,
              contract,
              transactionReceipt
            )
          }
        })
    })
  }

  /**
   * Refresh the lock's data.
   * We use the block version
   * @return Promise<Lock>
   */
  getLock(address) {
    const contract = new this.web3.eth.Contract(LockContract.abi, address)
    const attributes = {
      keyPrice: x => Web3Utils.fromWei(x, 'ether'),
      expirationDuration: parseInt,
      maxNumberOfKeys: value => {
        if (value === MAX_UINT) {
          return -1
        }
        return parseInt(value)
      },
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

    // Let's load the current block to use to compare versions
    constantPromises.push(
      this.web3.eth.getBlockNumber().then(blockNumber => {
        update.asOf = blockNumber
      })
    )

    // Once all lock attributes have been fetched
    return Promise.all(constantPromises).then(() => {
      this.emit('lock.updated', address, update)
      return update
    })
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

  _emitKeyOwners(lock, page, keyPromises) {
    return Promise.all(keyPromises).then(keys => {
      this.emit('keys.page', lock, page, keys.filter(key => !!key))
    })
  }

  _packageKeyholderInfo(lock, lockContract, ownerAddress) {
    return this._getKeyByLockForOwner(lockContract, ownerAddress).then(
      ([expiration, data]) => {
        return {
          id: keyId(lock, ownerAddress),
          lock,
          owner: ownerAddress,
          expiration,
          data,
        }
      }
    )
  }

  _genKeyOwnersFromLockContractIterative(lock, lockContract, page, byPage) {
    const startIndex = page * byPage
    return new Promise(resolve => {
      let keyPromises = Array.from(Array(byPage).keys()).map(n => {
        return lockContract.methods
          .owners(n + startIndex)
          .call()
          .then(ownerAddress => {
            return this._packageKeyholderInfo(lock, lockContract, ownerAddress)
          })
          .catch(() => {
            return null
          })
      })

      resolve(keyPromises)
    })
  }

  _genKeyOwnersFromLockContract(lock, lockContract, page, byPage) {
    return new Promise((resolve, reject) => {
      lockContract.methods
        .getOwnersByPage(page, byPage)
        .call()
        .then(ownerAddresses => {
          let keyPromises = ownerAddresses.map(ownerAddress => {
            return this._packageKeyholderInfo(lock, lockContract, ownerAddress)
          })

          resolve(keyPromises)
        })
        .catch(error => reject(error))
    })
  }

  /**
   * This loads and returns the keys for a lock per page
   * we fetch byPage number of keyOwners and dispatch for futher details.
   *
   * This method will attempt to retrieve keyholders directly from the smart contract, if this
   * raises and exception the code will attempt to iteratively retrieve the keyholders.
   * (Relevant to issue #1116)
   * @param {PropTypes.string}
   * @param {PropTypes.integer}
   * @param {PropTypes.integer}
   */
  getKeysForLockOnPage(lock, page, byPage) {
    const lockContract = new this.web3.eth.Contract(LockContract.abi, lock)

    this._genKeyOwnersFromLockContract(lock, lockContract, page, byPage).then(
      keyPromises => {
        if (keyPromises.length == 0) {
          this._genKeyOwnersFromLockContractIterative(
            lock,
            lockContract,
            page,
            byPage
          ).then(keyPromises => this._emitKeyOwners(lock, page, keyPromises))
        } else {
          this._emitKeyOwners(lock, page, keyPromises)
        }
      }
    )
  }
}
