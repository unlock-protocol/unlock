import Web3 from 'web3'
import Web3Utils from 'web3-utils'
import { bufferToHex, generateAddress } from 'ethereumjs-util'
import UnlockService from './unlockService'
import { MAX_UINT, UNLIMITED_KEYS_COUNT, KEY_ID } from './constants'

/**
 * This service reads data from the RPC endpoint.
 * All transactions should be sent via the WalletService.
 */
export default class Web3Service extends UnlockService {
  constructor({
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
  }) {
    super({ unlockAddress })

    this.web3 = new Web3(readOnlyProvider)
    this.blockTime = blockTime
    this.requiredConfirmations = requiredConfirmations

    // Transactions create events which we use here to build the state.
    // TODO we should ensure that the contracts triggering the events are the right ones
    this.eventsHandlers = {
      NewLock: (transactionHash, contractAddress, blockNumber, args) => {
        this.emit('transaction.updated', transactionHash, {
          lock: args.newLockAddress,
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
          key: KEY_ID(contractAddress, owner),
          lock: contractAddress,
        })
        return this.emit('key.saved', KEY_ID(contractAddress, owner), {
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

    // Pending transactions may still update the state
    // TODO we should ensure that the contracts invoking the methods are the right ones
    this.inputsHandlers = {
      createLock: async (transactionHash, contractAddress, params) => {
        // The annoying part here is that we do not have the lock address...
        // Since it is not an argument to the function.
        // We will 'guess' it again using generateLockAddress
        // knowing that this may create a race condition another lock creation pending transaction
        // exists.
        const newLockAddress = await this.generateLockAddress()
        this.emit('transaction.updated', transactionHash, {
          lock: newLockAddress,
        })

        if (params._maxNumberOfKeys === MAX_UINT) {
          params._maxNumberOfKeys = UNLIMITED_KEYS_COUNT
        }

        this.emit('lock.updated', newLockAddress, {
          transaction: transactionHash,
          address: newLockAddress,
          expirationDuration: +params._expirationDuration,
          keyPrice: Web3Utils.fromWei(params._keyPrice, 'ether'), // Must be expressed in Eth!
          maxNumberOfKeys: +params._maxNumberOfKeys,
          outstandingKeys: 0,
          balance: '0', // Must be expressed in Eth!
        })
      },
      purchaseFor: async (transactionHash, contractAddress, params) => {
        const owner = params._recipient
        this.emit('transaction.updated', transactionHash, {
          key: KEY_ID(contractAddress, owner),
          lock: contractAddress,
        })
        return this.emit('key.saved', KEY_ID(contractAddress, owner), {
          lock: contractAddress,
          owner,
        })
      },
    }
  }

  /**
   * "Guesses" what the next Lock's address is going to be
   */
  async generateLockAddress() {
    let transactionCount = await this.web3.eth.getTransactionCount(
      this.unlockContractAddress
    )
    return Web3Utils.toChecksumAddress(
      bufferToHex(generateAddress(this.unlockContractAddress, transactionCount))
    )
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
  async getTransactionType(contract, data) {
    const version = await this.unlockContractAbiVersion()
    return version.getTransactionType.bind(this)(contract, data)
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
  async getPastLockCreationsTransactionsForUser(address) {
    const version = await this.lockContractAbiVersion(address)
    return version.getPastLockCreationsTransactionsForUser.bind(this)(address)
  }

  /**
   * This function is able to retrieve the past transaction on a lock as long as these transactions
   * triggered events.
   * @param {*} lockAddress
   */
  async getPastLockTransactions(lockAddress) {
    const version = await this.lockContractAbiVersion(lockAddress)
    return version.getPastLockTransactions.bind(this)(lockAddress)
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
   * This is used to identify data which should be changed by a pending transaction
   * @param {*} transactionHash
   * @param {*} contract
   * @param {*} input
   * @param {*} contractAddress
   */
  async parseTransactionFromInput(
    transactionHash,
    contract,
    input,
    contractAddress
  ) {
    const version = await this.unlockContractAbiVersion()
    return version.parseTransactionFromInput.bind(this)(
      transactionHash,
      contract,
      input,
      contractAddress
    )
  }

  /**
   * This will set a timeout to get a transaction after half a block time happened
   * @param {string} transactionHash
   */
  _watchTransaction(transactionHash) {
    setTimeout(() => {
      this.getTransaction(transactionHash)
    }, this.blockTime / 2)
  }

  /**
   * The transaction is still pending: it has been sent to the network but not
   * necessarily received by the node we're asking it (and not mined...)
   * @param {*} transactionHash
   * @param {*} blockNumber
   * @param {object} defaults
   * @private
   */
  async _getSubmittedTransaction(transactionHash, blockNumber, defaults) {
    const version = await this.unlockContractAbiVersion()
    return version._getSubmittedTransaction.bind(this)(
      transactionHash,
      blockNumber,
      defaults
    )
  }

  /**
   * This means the transaction is not in a block yet (ie. not mined), but has been propagated
   * We do not know what the transacion is about though so we need to extract its info from
   * the input.
   * @param {*} blockTransaction
   * @private
   */
  async _getPendingTransaction(blockTransaction) {
    const version = await this.unlockContractAbiVersion()
    return version._getPendingTransaction.bind(this)(blockTransaction)
  }

  /**
   * This refreshes a transaction by its hash.
   * It will only process the transaction if the filter function returns true
   * @param {string} transactionHash
   * @param {object} filter
   */
  async getTransaction(transactionHash, defaults) {
    const version = await this.unlockContractAbiVersion()
    return version.getTransaction.bind(this)(transactionHash, defaults)
  }

  /**
   * Refresh the lock's data.
   * We use the block version
   * @return Promise<Lock>
   */
  async getLock(address) {
    const version = await this.lockContractAbiVersion(address)
    return version.getLock.bind(this)(address)
  }

  /**
   * Returns the key to the lock by the account.
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   */
  async getKeyByLockForOwner(lock, owner) {
    const version = await this.lockContractAbiVersion(lock)
    return version.getKeyByLockForOwner.bind(this)(lock, owner)
  }

  /**
   * Returns the key to the lock by the account.
   * @private
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   * @return Promise<>
   */
  async _getKeyByLockForOwner(lockContract, owner) {
    const version = await this.lockContractAbiVersion(lockContract)
    return version._getKeyByLockForOwner.bind(this)(lockContract, owner)
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
          id: KEY_ID(lock, ownerAddress),
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
  async getKeysForLockOnPage(lock, page, byPage) {
    const version = await this.lockContractAbiVersion(lock)
    return version.getKeysForLockOnPage.bind(this)(lock, page, byPage)
  }
}
