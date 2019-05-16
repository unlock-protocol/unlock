import Web3 from 'web3'
import {
  providers as ethersProviders,
  utils as ethersMetadataHandling,
} from 'ethers'
import { bufferToHex, generateAddress } from 'ethereumjs-util'
import Web3Utils from './utils'
import ethers_utils from './utils.ethers'
import TransactionTypes from './transactionTypes'
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
    useEthers,
  }) {
    super({ unlockAddress })

    if (useEthers) {
      this.ethers_setup(readOnlyProvider)
    } else {
      this.web3 = new Web3(readOnlyProvider)
    }
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

    // Transactions create events which we use here to build the state.
    // TODO we should ensure that the contracts triggering the events are the right ones
    this.ethers_eventsHandlers = {
      NewLock: (transactionHash, contractAddress, blockNumber, args) => {
        this.emit('transaction.updated', transactionHash, {
          lock: args.newLockAddress,
        })
        this.emit('lock.updated', args.newLockAddress, {
          asOf: blockNumber,
          transaction: transactionHash,
          address: args.newLockAddress,
        })
        return this.ethers_getLock(args.newLockAddress)
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
          keyPrice: ethers_utils.fromWei(keyPrice, 'ether'),
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

    this.ethers_inputsHandlers = {
      createLock: async (transactionHash, contractAddress, params) => {
        // The annoying part here is that we do not have the lock address...
        // Since it is not an argument to the function.
        // We will 'guess' it again using generateLockAddress
        // knowing that this may create a race condition another lock creation pending transaction
        // exists.
        const newLockAddress = await this.ethers_generateLockAddress()
        this.emit('transaction.updated', transactionHash, {
          lock: newLockAddress,
        })

        if (ethers_utils.isInfiniteKeys(params._maxNumberOfKeys)) {
          params._maxNumberOfKeys = UNLIMITED_KEYS_COUNT
        }

        this.emit('lock.updated', newLockAddress, {
          transaction: transactionHash,
          address: newLockAddress,
          expirationDuration: +params._expirationDuration,
          keyPrice: ethers_utils.fromWei(params._keyPrice, 'ether'), // Must be expressed in Eth!
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
   * Temporary function that allows us to use ethers functionality
   * without interfering with web3. This will be moved to the constructor when
   * we remove web3
   */
  ethers_setup(readOnlyProvider) {
    if (typeof readOnlyProvider === 'string') {
      this.provider = new ethersProviders.JsonRpcProvider(readOnlyProvider)
    } else if (readOnlyProvider.send) {
      this.provider = new ethersProviders.Web3Provider(readOnlyProvider)
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
   * "Guesses" what the next Lock's address is going to be
   */
  async ethers_generateLockAddress() {
    let transactionCount = await this.provider.getTransactionCount(
      this.unlockContractAddress
    )

    return ethersMetadataHandling.getContractAddress({
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
    })
  }

  /**
   * The method sets the transaction's type, based on the data being sent.
   * @param {*} contract
   * @param {*} data
   */
  _getTransactionType(contract, data) {
    const method = contract.abi.find(binaryInterface => {
      if (binaryInterface.type !== 'function') {
        return false
      }
      const signature = this.web3.eth.abi.encodeFunctionSignature(
        binaryInterface
      )
      return data.startsWith(signature)
    })

    // If there is no matching method, return null
    if (!method) {
      return null
    }

    if (contract.contractName === 'Unlock' && method.name === 'createLock') {
      return TransactionTypes.LOCK_CREATION
    }

    if (
      contract.contractName === 'PublicLock' &&
      method.name === 'purchaseFor'
    ) {
      return TransactionTypes.KEY_PURCHASE
    }

    if (contract.contractName === 'PublicLock' && method.name === 'withdraw') {
      return TransactionTypes.WITHDRAWAL
    }

    if (
      contract.contractName === 'PublicLock' &&
      method.name === 'updateKeyPrice'
    ) {
      return TransactionTypes.UPDATE_KEY_PRICE
    }

    // Unknown transaction
    return null
  }

  /**
   * The method sets the transaction's type, based on the data being sent.
   * @param {*} contract
   * @param {*} data
   */
  _ethers_getTransactionType(contract, data) {
    const contractName = contract.contractName
    if (!['PublicLock', 'Unlock'].includes(contractName)) {
      // Unknown contract!
      return null
    }

    const metadata = new ethersMetadataHandling.Interface(contract.abi)
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
    const version = await this.unlockContractAbiVersion()
    const unlock = new this.web3.eth.Contract(
      version.Unlock.abi,
      this.unlockContractAddress
    )
    return this._getPastTransactionsForContract(unlock, 'NewLock', {
      lockOwner: address,
    })
  }

  /**
   * This function is able to retrieve past transaction sent by a user to the Unlock smart contract
   * to create a new Lock.
   * @param {*} address
   */
  async ethers_getPastLockCreationsTransactionsForUser(address) {
    const unlock = await this.getUnlockContract()
    // only retrieve NewLock events
    const filter = unlock.filters.NewLock(address)
    return this._ethers_getPastTransactionsForContract(filter)
  }

  /**
   * This function is able to retrieve the past transaction on a lock as long as these transactions
   * triggered events.
   * @param {*} lockAddress
   */
  async getPastLockTransactions(lockAddress) {
    const version = await this.lockContractAbiVersion(lockAddress)
    const lockContract = new this.web3.eth.Contract(
      version.PublicLock.abi,
      lockAddress
    )
    return this._getPastTransactionsForContract(lockContract, 'allevents')
  }

  /**
   * This function is able to retrieve the past transaction on a lock as long as these transactions
   * triggered events.
   * @param {*} lockAddress
   */
  async ethers_getPastLockTransactions(lockAddress) {
    return this._ethers_getPastTransactionsForContract(lockAddress)
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
   * This function retrieves past transactions from events on a given contract
   * @param {*} filter
   * @private
   */
  async _ethers_getPastTransactionsForContract(filter) {
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
   * This retrieves the balance of an address (contract or account)
   * and formats it to a string of ether.
   * Returns a promise with the balance
   */
  async ethers_getAddressBalance(address) {
    try {
      const balance = await this.provider.getBalance(address)
      return ethers_utils.fromWei(balance, 'ether')
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
   * This function will trigger events based on smart contract events
   * @private
   * @param {string} transactionHash
   * @param {string} contractAddress
   * @param {string} blockNumber
   * @param {string} name
   * @param {object} params
   */
  ethers_emitContractEvent(
    transactionHash,
    contractAddress,
    blockNumber,
    name,
    params
  ) {
    const handler = this.ethers_eventsHandlers[name]
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
   */
  _parseTransactionLogsFromReceipt(
    version,
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
   * Given a transaction receipt and the abi for a contract, parses and trigger the
   * corresponding events
   * @private
   * @param {*} transactionHash
   * @param {*} contract
   * @param {*} transactionReceipt
   */
  _ethers_parseTransactionLogsFromReceipt(
    transactionHash,
    contract,
    transactionReceipt
  ) {
    const metadata = new ethersMetadataHandling.Interface(contract.abi)

    transactionReceipt.logs.forEach(log => {
      // For each log, let's find which event it is
      const logInfo = metadata.parseLog(log)

      this.ethers_emitContractEvent(
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
   * WEIRD: WE SHOULD NOT NEED TO GET THE VERSION SINCE WE HAVE THE CONTRACT!
   * @param {*} transactionHash
   * @param {*} contract
   * @param {*} input
   * @param {*} contractAddress
   */
  async _parseTransactionFromInput(
    version,
    transactionHash,
    contract,
    input,
    contractAddress
  ) {
    const transactionType = this._getTransactionType(contract, input)

    this.emit('transaction.updated', transactionHash, {
      status: 'pending',
      type: transactionType,
      confirmations: 0,
      blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
    })

    // Let's parse the transaction's input
    const method = contract.abi.find(binaryInterface => {
      return input.startsWith(binaryInterface.signature)
    })

    if (!method) {
      // The invoked function is not part of the ABI... this is an unknown transaction
      return
    }

    // The input actually includes the method signature, which should be removed
    // for parsing of the actual input values.
    input = input.replace(method.signature, '')
    const params = this.web3.eth.abi.decodeParameters(method.inputs, input)
    const handler = this.inputsHandlers[method.name]

    if (handler) {
      return handler(transactionHash, contractAddress, params)
    }
  }

  /**
   * This is used to identify data which should be changed by a pending transaction
   * with ethers, the version is unnecessary
   * @param {*} transactionHash
   * @param {*} contract
   * @param {*} input
   * @param {*} contractAddress
   */
  async _ethers_parseTransactionFromInput(
    version,
    transactionHash,
    contract,
    data,
    contractAddress
  ) {
    const transactionType = this._ethers_getTransactionType(contract, data)

    this.emit('transaction.updated', transactionHash, {
      status: 'pending',
      type: transactionType,
      confirmations: 0,
      blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
    })

    const metadata = new ethersMetadataHandling.Interface(contract.abi)

    const transactionInfo = metadata.parseTransaction({ data })

    if (!transactionInfo) {
      // The invoked function is not part of the ABI... this is an unknown transaction
      return
    }
    const handler = this.ethers_inputsHandlers[transactionInfo.name]
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
   * This will set a timeout to get a transaction after half a block time happened
   * @param {string} transactionHash
   */
  _ethers_watchTransaction(transactionHash) {
    setTimeout(() => {
      this.ethers_getTransaction(transactionHash)
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
      const contract =
        this.unlockContractAddress === Web3Utils.toChecksumAddress(defaults.to)
          ? version.Unlock
          : version.PublicLock

      return this._parseTransactionFromInput(
        version,
        transactionHash,
        contract,
        defaults.input,
        defaults.to
      )
    }

    return this.emit('transaction.updated', transactionHash, {
      status: 'submitted',
      confirmations: 0,
      blockNumber: Number.MAX_SAFE_INTEGER, // Asign the largest block number for sorting purposes
    })
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
  _ethers_getSubmittedTransaction(
    version,
    transactionHash,
    blockNumber,
    defaults
  ) {
    this._ethers_watchTransaction(transactionHash)

    // If we have default values for the transaction (passed by the walletService)
    if (defaults) {
      // const contractAddress = Web3Utils.toChecksumAddress(to) // web3 does not format addresses properly
      const contractAddress = defaults.to // ethers.js does format addresses in checksum format
      const contract =
        this.unlockContractAddress === contractAddress
          ? version.Unlock
          : version.PublicLock

      return this._ethers_parseTransactionFromInput(
        version,
        transactionHash,
        contract,
        defaults.input,
        defaults.to
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

    const contract =
      this.unlockContractAddress ===
      Web3Utils.toChecksumAddress(blockTransaction.to)
        ? version.Unlock
        : version.PublicLock

    return this._parseTransactionFromInput(
      version,
      blockTransaction.hash,
      contract,
      blockTransaction.input,
      blockTransaction.to
    )
  }

  /**
   * This means the transaction is not in a block yet (ie. not mined), but has been propagated
   * We do not know what the transacion is about though so we need to extract its info from
   * the input.
   * @param {*} blockTransaction
   * @private
   */
  _ethers_getPendingTransaction(version, blockTransaction) {
    this._ethers_watchTransaction(blockTransaction.hash)

    // const contractAddress = Web3Utils.toChecksumAddress(to) // web3 does not format addresses properly
    const contractAddress = blockTransaction.to // ethers.js does format addresses in checksum format
    const contract =
      this.unlockContractAddress === contractAddress
        ? version.Unlock
        : version.PublicLock

    return this._ethers_parseTransactionFromInput(
      version,
      blockTransaction.hash,
      contract,
      blockTransaction.data,
      blockTransaction.to
    )
  }

  /**
   * This refreshes a transaction by its hash.
   * It will only process the transaction if the filter function returns true
   * @param {string} transactionHash
   * @param {object} filter
   */
  async getTransaction(transactionHash, defaults) {
    return Promise.all([
      this.web3.eth.getBlockNumber(),
      this.web3.eth.getTransaction(transactionHash),
    ]).then(async ([blockNumber, blockTransaction]) => {
      // Let's find the type of contract before we can get its version
      const to = blockTransaction ? blockTransaction.to : defaults.to
      let version
      if (this.unlockContractAddress === Web3Utils.toChecksumAddress(to)) {
        version = await this.unlockContractAbiVersion()
      } else {
        version = await this.lockContractAbiVersion(to)
      }

      // If the block transaction is missing the transacion has been submitted but not
      // received by all nodes
      if (!blockTransaction) {
        return this._getSubmittedTransaction(
          version,
          transactionHash,
          blockNumber,
          defaults
        )
      }

      // If the block number is missing the transaction has been received by the node
      // but not mined yet
      if (blockTransaction.blockNumber === null) {
        return this._getPendingTransaction(version, blockTransaction)
      }

      // The transaction has been mined :

      const contract =
        this.unlockContractAddress ===
        Web3Utils.toChecksumAddress(blockTransaction.to)
          ? version.Unlock
          : version.PublicLock

      const transactionType = this._getTransactionType(
        contract,
        blockTransaction.input
      )
      // Let's watch for more confirmations if needed
      if (
        blockNumber - blockTransaction.blockNumber <
        this.requiredConfirmations
      ) {
        this._watchTransaction(transactionHash)
      }

      // The transaction was mined, so we should have a receipt for it
      this.emit('transaction.updated', transactionHash, {
        status: 'mined',
        type: transactionType,
        confirmations: Math.max(blockNumber - blockTransaction.blockNumber, 0),
        blockNumber: blockTransaction.blockNumber,
      })

      const transactionReceipt = await this.web3.eth.getTransactionReceipt(
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
          version,
          transactionHash,
          contract,
          transactionReceipt
        )
      }
    })
  }

  /**
   * This refreshes a transaction by its hash.
   * It will only process the transaction if the filter function returns true
   * @param {string} transactionHash
   * @param {object} filter
   */
  async ethers_getTransaction(transactionHash, defaults) {
    return Promise.all([
      this.provider.getBlockNumber(),
      this.provider.getTransaction(transactionHash),
    ]).then(async ([blockNumber, blockTransaction]) => {
      // Let's find the type of contract before we can get its version
      const to = blockTransaction ? blockTransaction.to : defaults.to
      let version
      // const contractAddress = Web3Utils.toChecksumAddress(to) // web3 does not format addresses properly
      const contractAddress = to // ethers.js does format addresses in checksum format
      if (this.unlockContractAddress === contractAddress) {
        version = await this.ethers_unlockContractAbiVersion()
      } else {
        version = await this.ethers_lockContractAbiVersion(to)
      }

      // If the block transaction is missing the transacion has been submitted but not
      // received by all nodes
      if (!blockTransaction) {
        return this._ethers_getSubmittedTransaction(
          version,
          transactionHash,
          blockNumber,
          defaults
        )
      }

      // If the block number is missing the transaction has been received by the node
      // but not mined yet
      if (blockTransaction.blockNumber === null) {
        return this._ethers_getPendingTransaction(version, blockTransaction)
      }

      // The transaction has been mined :

      const contract =
        this.unlockContractAddress === contractAddress
          ? version.Unlock
          : version.PublicLock

      const transactionType = this._ethers_getTransactionType(
        contract,
        blockTransaction.data
      )
      // Let's watch for more confirmations if needed
      if (
        blockNumber - blockTransaction.blockNumber <
        this.requiredConfirmations
      ) {
        this._ethers_watchTransaction(transactionHash)
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
        return this._ethers_parseTransactionLogsFromReceipt(
          transactionHash,
          contract,
          transactionReceipt
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
   * Refresh the lock's data.
   * We use the block version
   * @return Promise<Lock>
   */
  async ethers_getLock(address) {
    const version = await this.ethers_lockContractAbiVersion(address)
    return version.ethers_getLock.bind(this)(address)
  }

  /**
   * Returns the key to the lock by the account.
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   */
  async getKeyByLockForOwner(lock, owner) {
    const version = await this.lockContractAbiVersion(lock)
    const lockContract = new this.web3.eth.Contract(
      version.PublicLock.abi,
      lock
    )
    return this._getKeyByLockForOwner(lockContract, owner).then(expiration => {
      this.emit('key.updated', KEY_ID(lock, owner), {
        lock,
        owner,
        expiration,
      })
    })
  }

  /**
   * Returns the key to the lock by the account.
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   */
  async ethers_getKeyByLockForOwner(lock, owner) {
    const lockContract = await this.getLockContract(lock)
    return this._ethers_getKeyByLockForOwner(lockContract, owner).then(
      expiration => {
        this.emit('key.updated', KEY_ID(lock, owner), {
          lock,
          owner,
          expiration,
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
  async _getKeyByLockForOwner(lockContract, owner) {
    try {
      const expiration = await lockContract.methods
        .keyExpirationTimestampFor(owner)
        .call()
      // Handling NO_SUCH_KEY
      // TODO find a more robust approach (apparently the call above should throw, but it does not!)
      if (
        expiration ==
        '3963877391197344453575983046348115674221700746820753546331534351508065746944'
      ) {
        return 0
      }
      return parseInt(expiration, 10)
    } catch (error) {
      return 0
    }
  }

  /**
   * Returns the key to the lock by the account.
   * @private
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   * @return Promise<>
   */
  async _ethers_getKeyByLockForOwner(lockContract, owner) {
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

  /**
   * @private
   * @param {*} lock
   * @param {*} lockContract
   * @param {*} ownerAddress
   */
  _ethers_packageKeyholderInfo(lock, lockContract, ownerAddress) {
    return this._ethers_getKeyByLockForOwner(lockContract, ownerAddress).then(
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

  _ethers_genKeyOwnersFromLockContractIterative(
    lock,
    lockContract,
    page,
    byPage
  ) {
    const startIndex = page * byPage
    return new Promise(resolve => {
      let keyPromises = Array.from(Array(byPage).keys()).map(n => {
        return lockContract.functions
          .owners(n + startIndex)
          .then(ownerAddress => {
            return this._ethers_packageKeyholderInfo(
              lock,
              lockContract,
              ownerAddress
            )
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

  _ethers_genKeyOwnersFromLockContract(lock, lockContract, page, byPage) {
    return new Promise((resolve, reject) => {
      try {
        lockContract.functions
          .getOwnersByPage(page, byPage)
          .then(ownerAddresses => {
            const keyPromises = ownerAddresses.map(ownerAddress => {
              return this._ethers_packageKeyholderInfo(
                lock,
                lockContract,
                ownerAddress
              )
            })

            resolve(keyPromises)
          })
          .catch(error => reject(error))
      } catch (e) {
        reject(e)
      }
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
    const lockContract = new this.web3.eth.Contract(
      version.PublicLock.abi,
      lock
    )

    this._ethers_genKeyOwnersFromLockContract(
      lock,
      lockContract,
      page,
      byPage
    ).then(keyPromises => {
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
  async ethers_getKeysForLockOnPage(lock, page, byPage) {
    const lockContract = await this.getLockContract(lock)

    this._ethers_genKeyOwnersFromLockContract(lock, lockContract, page, byPage)
      .then(keyPromises => {
        if (keyPromises.length == 0) {
          this._ethers_genKeyOwnersFromLockContractIterative(
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
        this._ethers_genKeyOwnersFromLockContractIterative(
          lock,
          lockContract,
          page,
          byPage
        ).then(keyPromises => this._emitKeyOwners(lock, page, keyPromises))
      })
  }

  async recoverAccountFromSignedData(data, signedData, callback) {
    const address = await this.web3.eth.personal.ecRecover(data, signedData)
    callback(null, address)
  }
}
