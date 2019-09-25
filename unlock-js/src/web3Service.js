import { ethers } from 'ethers'
import utils from './utils'
import TransactionTypes from './transactionTypes'
import UnlockService from './unlockService'
import FetchJsonProvider from './FetchJsonProvider'
import { UNLIMITED_KEYS_COUNT, KEY_ID } from './constants'
import { getErc20TokenSymbol } from './erc20'

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

    this.setup(readOnlyProvider)
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
          for: owner, // this is not necessarily the same as the "from" address
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
          keyPrice: utils.fromWei(keyPrice, 'ether'),
        })
      },
      Withdrawal: (transactionHash, contractAddress) => {
        // TODO: update the lock balance too!
        this.emit('transaction.updated', transactionHash, {
          lock: contractAddress,
        })
      },
    }

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

        if (utils.isInfiniteKeys(params._maxNumberOfKeys)) {
          params._maxNumberOfKeys = UNLIMITED_KEYS_COUNT
        }

        this.emit('lock.updated', newLockAddress, {
          transaction: transactionHash,
          address: newLockAddress,
          expirationDuration: +params._expirationDuration,
          keyPrice: utils.fromWei(params._keyPrice, 'ether'), // Must be expressed in Eth!
          maxNumberOfKeys: +params._maxNumberOfKeys,
          outstandingKeys: 0,
          balance: '0', // Must be expressed in Eth!
        })
      },
      purchaseFor: async (transactionHash, contractAddress, params) => {
        const owner = params._recipient
        this.emit('transaction.updated', transactionHash, {
          key: KEY_ID(contractAddress, owner),
          for: owner, // this is not necessarily the same as the "from" address
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
   * Temporary function that allows us to use ethers functionality
   * without interfering with web3. This will be moved to the constructor when
   * we remove web3
   */
  setup(readOnlyProvider) {
    if (typeof readOnlyProvider === 'string') {
      this.provider = new FetchJsonProvider(readOnlyProvider)
    } else if (readOnlyProvider.send) {
      this.provider = new ethers.providers.Web3Provider(readOnlyProvider)
    }
  }

  /**
   * "Guesses" what the next Lock's address is going to be
   */
  async generateLockAddress() {
    let transactionCount = await this.provider.getTransactionCount(
      this.unlockContractAddress
    )

    return ethers.utils.getContractAddress({
      from: this.unlockContractAddress,
      nonce: transactionCount,
    })
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
      return balance
    })
  }

  /**
   * The method sets the transaction's type, based on the data being sent.
   * @param {*} contract
   * @param {*} data
   */
  _getTransactionType(contract, data) {
    const contractName = contract.contractName
    if (!['PublicLock', 'Unlock'].includes(contractName)) {
      // Unknown contract!
      return null
    }

    const metadata = new ethers.utils.Interface(contract.abi)
    const transactionInfo = metadata.parseTransaction({ data })

    // If there is no matching method, return null
    if (!transactionInfo) {
      return null
    }

    const method = transactionInfo.name

    if (contractName === 'Unlock') {
      if (method !== 'createLock') return null
      return TransactionTypes.LOCK_CREATION
    }

    // if we reach here, the contract is PublicLock
    switch (method) {
      case 'purchaseFor':
        return TransactionTypes.KEY_PURCHASE
      case 'withdraw':
        return TransactionTypes.WITHDRAWAL
      case 'updateKeyPrice':
        return TransactionTypes.UPDATE_KEY_PRICE
      default:
        // Unknown transaction
        return null
    }
  }

  /**
   * This function is able to retrieve past transaction sent by a user to the Unlock smart contract
   * to create a new Lock.
   * @param {*} address
   */
  async getPastLockCreationsTransactionsForUser(address) {
    const unlock = await this.getUnlockContract()
    // only retrieve NewLock events
    const filter = unlock.filters.NewLock(address)
    return this._getPastTransactionsForContract(filter)
  }

  /**
   * This function is able to retrieve the past transaction on a lock as long as these transactions
   * triggered events.
   * @param {*} lockAddress
   */
  async getPastLockTransactions(lockAddress) {
    return this._getPastTransactionsForContract(lockAddress)
  }

  /**
   * This function retrieves past transactions from events on a given contract
   * @param {*} filter
   * @private
   */
  async _getPastTransactionsForContract(filter) {
    const events = await this.provider.getLogs({
      fromBlock: 0, // TODO start only when the smart contract was deployed?
      toBlock: 'latest',
      ...filter,
    })
    events.forEach(event => {
      this.emit('transaction.new', event.transactionHash)
    })
    return events
  }

  /**
   * This retrieves the balance of an address (contract or account)
   * and formats it to a string of ether.
   * Returns a promise with the balance
   */
  async getAddressBalance(address) {
    try {
      const balance = await this.provider.getBalance(address)
      return utils.fromWei(balance, 'ether')
    } catch (error) {
      this.emit('error', error)
    }
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
   * @private
   * @param {*} transactionHash
   * @param {*} contract
   * @param {*} transactionReceipt
   * @param {string} contractAddress
   */
  _parseTransactionLogsFromReceipt(
    transactionHash,
    contract,
    transactionReceipt,
    contractAddress
  ) {
    const parser = new ethers.utils.Interface(contract.abi)

    transactionReceipt.logs.forEach(log => {
      // ignore events not from our contract
      if (log.address !== contractAddress) return
      // For each log, let's find which event it is
      const logInfo = parser.parseLog(log)

      this.emitContractEvent(
        transactionHash,
        log.address,
        transactionReceipt.blockNumber,
        logInfo.name,
        logInfo.values
      )
    })
  }

  /**
   * This is used to identify data which should be changed by a pending transaction
   * with ethers, the version is unnecessary
   * @param {*} transactionHash
   * @param {*} contract
   * @param {*} input
   * @param {*} contractAddress
   */
  async _parseTransactionFromInput(
    version,
    transactionHash,
    contract,
    data,
    contractAddress,
    status = 'pending'
  ) {
    const transactionType = this._getTransactionType(contract, data)

    this.emit('transaction.updated', transactionHash, {
      status,
      type: transactionType,
      confirmations: 0,
      blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
    })

    const metadata = new ethers.utils.Interface(contract.abi)

    const transactionInfo = metadata.parseTransaction({ data })

    if (!transactionInfo) {
      // The invoked function is not part of the ABI... this is an unknown transaction
      return
    }
    const handler = this.inputsHandlers[transactionInfo.name]
    const functionInputs = metadata.functions[transactionInfo.name].inputs
    const args = transactionInfo.args.reduce((args, arg, i) => {
      return Object.assign(args, { [functionInputs[i].name]: arg })
    }, {})

    if (handler) {
      return handler(transactionHash, contractAddress, args)
    }
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
   * @param {*} version
   * @param {*} transactionHash
   * @param {*} blockNumber
   * @param {object} defaults
   * @private
   */
  _getSubmittedTransaction(version, transactionHash, blockNumber, defaults) {
    this._watchTransaction(transactionHash)

    // If we have default values for the transaction (passed by the walletService)
    if (defaults) {
      // const contractAddress = Web3Utils.toChecksumAddress(to) // web3 does not format addresses properly
      const contractAddress = defaults.to // ethers.js does format addresses in checksum format
      const contract =
        this.unlockContractAddress === contractAddress
          ? version.Unlock
          : version.PublicLock

      return this._parseTransactionFromInput(
        version,
        transactionHash,
        contract,
        defaults.input,
        defaults.to,
        'submitted'
      )
    }

    return this.emit('transaction.updated', transactionHash, {
      status: 'submitted',
      confirmations: 0,
      blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
    })
  }

  /**
   * This means the transaction is not in a block yet (ie. not mined), but has been propagated
   * We do not know what the transacion is about though so we need to extract its info from
   * the input.
   * @param {*} blockTransaction
   * @private
   */
  _getPendingTransaction(version, blockTransaction) {
    this._watchTransaction(blockTransaction.hash)

    // const contractAddress = Web3Utils.toChecksumAddress(to) // web3 does not format addresses properly
    const contractAddress = blockTransaction.to // ethers.js does format addresses in checksum format
    const contract =
      this.unlockContractAddress === contractAddress
        ? version.Unlock
        : version.PublicLock

    return this._parseTransactionFromInput(
      version,
      blockTransaction.hash,
      contract,
      blockTransaction.data,
      blockTransaction.to,
      'pending'
    )
  }

  /**
   * This refreshes a transaction by its hash.
   * It will only process the transaction if the filter function returns true
   * There are at least 4 states for a transaction
   * 1- The node does not know about it
   * 2- The node knows about it but it has not been mined
   * 3- The node knows about it and it has been mined but not confirmed (12 blocks)
   * 4- The node knows about it and it has been mined and confirmed
   * @param {string} transactionHash
   * @param {object} filter
   */
  async getTransaction(transactionHash, defaults) {
    return Promise.all([
      this.provider.getBlockNumber(),
      this.provider.getTransaction(transactionHash),
    ]).then(async ([blockNumber, blockTransaction]) => {
      if (!blockTransaction) {
        // Case 1
        // Here the node does not know about it.
        // This could either be that the node is "late" (transaction is very recent)
        // of the transaction was cancelled/dropped.
        // We should watch just in case this is a "late" transaction

        // If we have defaults, we should parse them
        if (defaults) {
          let version
          // const contractAddress = Web3Utils.toChecksumAddress(to) // web3 does not format addresses properly
          const contractAddress = defaults.to // ethers.js does format addresses in checksum format
          if (this.unlockContractAddress === contractAddress) {
            version = await this.unlockContractAbiVersion()
          } else {
            version = await this.lockContractAbiVersion(defaults.to)
          }
          return this._getSubmittedTransaction(
            version,
            transactionHash,
            blockNumber,
            defaults
          )
        } else {
          this._watchTransaction(transactionHash)
          return null
        }
      }

      // Here we have a block transaction , which means the node knows about it
      // Let's find the type of contract before we can get its version
      let version
      // const contractAddress = Web3Utils.toChecksumAddress(to) // web3 does not format addresses properly
      const contractAddress = blockTransaction.to // ethers.js does format addresses in checksum format
      if (this.unlockContractAddress === contractAddress) {
        version = await this.unlockContractAbiVersion()
      } else {
        version = await this.lockContractAbiVersion(contractAddress)
      }

      // If the block number is missing the transaction has been received by the node
      // but not mined yet
      if (blockTransaction.blockNumber === null) {
        // Case 2
        // Node knows about it and it has not been mined
        return this._getPendingTransaction(version, blockTransaction)
      }

      // The transaction has been mined :
      const contract =
        this.unlockContractAddress === contractAddress
          ? version.Unlock
          : version.PublicLock

      const transactionType = this._getTransactionType(
        contract,
        blockTransaction.data
      )
      // Let's watch for more confirmations if needed
      if (
        blockNumber - blockTransaction.blockNumber <
        this.requiredConfirmations
      ) {
        // Case 3
        this._watchTransaction(transactionHash)
      }

      // The transaction was mined, so we should have a receipt for it
      this.emit('transaction.updated', transactionHash, {
        status: 'mined',
        type: transactionType,
        confirmations: Math.max(blockNumber - blockTransaction.blockNumber, 0),
        blockNumber: blockTransaction.blockNumber,
      })

      const transactionReceipt = await this.provider.getTransactionReceipt(
        transactionHash
      )

      if (transactionReceipt) {
        // NOTE: old version of web3.js (pre 1.0.0-beta.34) are not parsing 0x0 into a falsy value
        if (!transactionReceipt.status || transactionReceipt.status == '0x0') {
          return this.emit('transaction.updated', transactionHash, {
            status: 'failed',
          })
        }
        return this._parseTransactionLogsFromReceipt(
          transactionHash,
          contract,
          transactionReceipt,
          contractAddress
        )
      }
    })
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
    const lockContract = await this.getLockContract(lock)
    return this._getKeyByLockForOwner(lockContract, owner).then(expiration => {
      let keyPayload = {
        lock,
        owner,
        expiration,
      }

      this.emit('key.updated', KEY_ID(lock, owner), keyPayload)
      return keyPayload
    })
  }

  /**
   * Returns the key to the lock by the account.
   * @private
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   * @return Promise<>
   */
  async _getKeyByLockForOwner(lockContract, owner) {
    try {
      const expiration = await lockContract.keyExpirationTimestampFor(owner)
      if (
        expiration ==
        '3963877391197344453575983046348115674221700746820753546331534351508065746944'
      ) {
        // Handling NO_SUCH_KEY
        // this portion is probably unnecessary, will need to test against the app to be sure
        return 0
      }
      return parseInt(expiration, 10)
    } catch (error) {
      return 0
    }
  }

  _emitKeyOwners(lock, page, keyPromises) {
    return Promise.all(keyPromises).then(keys => {
      this.emit('keys.page', lock, page, keys.filter(key => !!key))
    })
  }

  /**
   * @private
   * @param {*} lock
   * @param {*} lockContract
   * @param {*} ownerAddress
   */
  _packageKeyholderInfo(lock, lockContract, ownerAddress) {
    return this._getKeyByLockForOwner(lockContract, ownerAddress).then(
      expiration => {
        return {
          id: KEY_ID(lock, ownerAddress),
          lock,
          owner: ownerAddress,
          expiration,
        }
      }
    )
  }

  _genKeyOwnersFromLockContractIterative(lock, lockContract, page, byPage) {
    const startIndex = page * byPage
    return new Promise(resolve => {
      let keyPromises = Array.from(Array(byPage).keys()).map(n => {
        return lockContract.functions
          .owners(n + startIndex)
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
      lockContract.functions
        .getOwnersByPage(page, byPage)
        .then(ownerAddresses => {
          const keyPromises = ownerAddresses.map(ownerAddress => {
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
    const lockContract = await this.getLockContract(lock)

    this._genKeyOwnersFromLockContract(lock, lockContract, page, byPage)
      .then(keyPromises => {
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
      })
      .catch(() => {
        this._genKeyOwnersFromLockContractIterative(
          lock,
          lockContract,
          page,
          byPage
        ).then(keyPromises => this._emitKeyOwners(lock, page, keyPromises))
      })
  }

  /**
   * Given some data and a signed version of the same, returns the address of the account that signed it
   * @param data
   * @param signedData
   * @returns {Promise<*>}
   */
  async recoverAccountFromSignedData(data, signedData) {
    return utils.verifyMessage(data, signedData)
  }

  /**
   * Given an ERC20 token contract address, resolve with the symbol that identifies that token.
   * Additionally emits an event that maps the address to the symbol.
   * @param {string} contractAddress
   * @returns {Promise<string>}
   */
  async getTokenSymbol(contractAddress) {
    const symbolPromise = getErc20TokenSymbol(contractAddress, this.provider)
    this.emitTokenSymbol(contractAddress, symbolPromise)
    return symbolPromise
  }

  /**
   * Given an ERC20 token contract address, and a promise that resolves to the symbol that identifies the token,
   * emit a event that maps the address to the symbol.
   * @param {string} contractAddress
   * @param {Promise<string>} symbolPromise
   */
  async emitTokenSymbol(contractAddress, symbolPromise) {
    const symbol = await symbolPromise
    this.emit('token.update', contractAddress, {
      symbol,
    })
  }

  /**
   * Given an ERC20 token contract address, resolve with the provided user's balance of that token.
   * @param {string} contractAddress
   * @param {string} userWalletAddress
   * @returns {Promise<string>}
   */
  async getTokenBalance(contractAddress, userWalletAddress) {
    const abi = ['function balanceOf(address owner) view returns (uint)']
    const contract = new ethers.Contract(contractAddress, abi, this.provider)
    try {
      const rawBalance = await contract.balanceOf(userWalletAddress)
      return ethers.utils.formatEther(rawBalance)
    } catch (e) {
      this.emit('error', e)
    }
  }
}
