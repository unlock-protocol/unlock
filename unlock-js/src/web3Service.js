import { ethers } from 'ethers'
import utils from './utils'
import TransactionTypes from './transactionTypes'
import UnlockService from './unlockService'
import FetchJsonProvider from './FetchJsonProvider'
import { UNLIMITED_KEYS_COUNT, KEY_ID } from './constants'
import {
  getErc20TokenSymbol,
  getErc20BalanceForAddress,
  getErc20Decimals,
} from './erc20'

/**
 * This service reads data from the RPC endpoint.
 * All transactions should be sent via the WalletService.
 */
export default class Web3Service extends UnlockService {
  constructor({ readOnlyProvider, unlockAddress, network }) {
    super({ unlockAddress })

    this.setup(readOnlyProvider, network)

    // Transactions create events which we use here to build the state.
    // TODO we should ensure that the contracts triggering the events are the right ones
    this.eventsHandlers = {
      NewLock: (transaction, contractAddress, blockNumber, args) => {
        transaction.lock = args.newLockAddress
        this.emit('lock.updated', args.newLockAddress, {
          asOf: blockNumber,
          transaction: transaction.hash,
          address: args.newLockAddress,
        })
        return this.getLock(args.newLockAddress)
      },
      Transfer: (transaction, contractAddress, blockNumber, args) => {
        const owner = args._to || args.to // v6 uses to instead of _to
        transaction.key = KEY_ID(contractAddress, owner) // TODOuse the token id!
        transaction.for = owner // this is not necessarily the same as the "from" address
        transaction.lock = contractAddress
        return this.emit('key.saved', KEY_ID(contractAddress, owner), {
          lock: contractAddress,
          owner,
        })
      },
      PriceChanged: (
        transaction,
        contractAddress,
        blockNumber,
        { keyPrice }
      ) => {
        transaction.lock = contractAddress

        return this.emit('lock.updated', contractAddress, {
          asOf: blockNumber,
          keyPrice: utils.fromWei(keyPrice, 'ether'), // TODO: THIS MAY NOT BE WEI FOR ERC20 LOCKS
        })
      },
      PricingChanged: (
        transaction,
        contractAddress,
        blockNumber,
        { keyPrice, tokenAddress }
      ) => {
        transaction.lock = contractAddress

        return this.emit('lock.updated', contractAddress, {
          asOf: blockNumber,
          tokenAddress,
          keyPrice: utils.fromWei(keyPrice, 'ether'), // TODO: THIS MAY NOT BE WEI FOR ERC20 LOCKS
        })
      },
      Withdrawal: (transaction, contractAddress) => {
        // TODO: update the lock balance too!
        transaction.lock = contractAddress
      },
    }

    this.inputsHandlers = {
      createLock: async (transaction, contractAddress, sender, params) => {
        // The annoying part here is that we do not have the lock address...
        // Since it is not an argument to the function.
        // We will 'guess' it again using generateLockAddress
        // knowing that this may create a race condition another lock creation pending transaction
        // exists.
        const newLockAddress = await this.generateLockAddress(sender, {
          name: params._lockName,
        })
        transaction.lock = newLockAddress

        if (utils.isInfiniteKeys(params._maxNumberOfKeys)) {
          params._maxNumberOfKeys = UNLIMITED_KEYS_COUNT
        }

        this.emit('lock.updated', newLockAddress, {
          transaction: transaction.hash,
          address: newLockAddress,
          expirationDuration: +params._expirationDuration,
          keyPrice: utils.fromWei(params._keyPrice, 'ether'), // Must be expressed in Eth!
          maxNumberOfKeys: +params._maxNumberOfKeys,
          outstandingKeys: 0,
          balance: '0', // Must be expressed in Eth!
        })
      },
      purchaseFor: async (transaction, contractAddress, sender, params) => {
        const owner = params._recipient
        transaction.key = KEY_ID(contractAddress, owner)
        transaction.for = owner // this is not necessarily the same as the "from" address
        transaction.lock = contractAddress

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
   * TODO: ^ assess this?
   */
  setup(readOnlyProvider, network) {
    if (typeof readOnlyProvider === 'string') {
      this.provider = new FetchJsonProvider({
        endpoint: readOnlyProvider,
        network,
      })
    } else if (readOnlyProvider.send) {
      this.provider = new ethers.providers.Web3Provider(readOnlyProvider)
    }
  }

  /**
   * Method which returns the create2 address based on the factory contract (unlock), the lock template,
   * the account and lock salt (both used to create a unique salt)
   * 0x3d602d80600a3d3981f3363d3d373d3d3d363d73 and 5af43d82803e903d91602b57fd5bf3 are the
   * bytecode for eip-1167 (which defines proxies for locks).
   * @private
   */
  _create2Address(unlockAddress, templateAddress, account, lockSalt) {
    const saltHex = `${account}${lockSalt}`
    const byteCode = `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${templateAddress.replace(
      /0x/,
      ''
    )}5af43d82803e903d91602b57fd5bf3`
    const byteCodeHash = utils.sha3(byteCode)

    const seed = ['ff', unlockAddress, saltHex, byteCodeHash]
      .map(x => x.replace(/0x/, ''))
      .join('')

    const address = utils.sha3(`0x${seed}`).slice(-40)

    return utils.toChecksumAddress(`0x${address}`)
  }

  /**
   * "Guesses" what the next Lock's address is going to be
   * After that, we need the lock object because create2 uses a salt which is used to know the address
   * TODO : ideally this code should be part of ethers... but it looks like it's not there yet.
   * For now, losely inspired by
   * https://github.com/HardlyDifficult/hardlydifficult-ethereum-contracts/blob/master/src/utils/create2.js#L29
   */
  async generateLockAddress(owner, lock) {
    const version = await this.unlockContractAbiVersion()
    if (['v5', 'v6', 'v7'].indexOf(version.version) > -1) {
      const unlockContact = await this.getUnlockContract()
      const templateAddress = await unlockContact.publicLockAddress()
      // Compute the hash identically to v5 (TODO: extract this?)
      const lockSalt = utils.sha3(utils.utf8ToHex(lock.name)).substring(2, 26) // 2+24
      return this._create2Address(
        this.unlockContractAddress,
        templateAddress,
        owner,
        lockSalt
      )
    }
    // TODO: once the contracts have been moved to v5, get rid of the code below as no lock will ever be deployed again from the old unlock contract!
    const transactionCount = await this.provider.getTransactionCount(
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
    const { contractName } = contract
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
      case 'purchase':
        return TransactionTypes.KEY_PURCHASE
      case 'purchaseFor':
        return TransactionTypes.KEY_PURCHASE
      case 'withdraw':
        return TransactionTypes.WITHDRAWAL
      case 'updateKeyPrice':
      case 'updateKeyPricing':
        return TransactionTypes.UPDATE_KEY_PRICE
      default:
        // Unknown transaction
        return null
    }
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
   * @param {object} transaction
   * @param {string} contractAddress
   * @param {string} blockNumber
   * @param {string} name
   * @param {object} params
   */
  emitContractEvent(transaction, contractAddress, blockNumber, name, params) {
    const handler = this.eventsHandlers[name]
    if (handler) {
      return handler(transaction, contractAddress, blockNumber, params)
    }
  }

  /**
   * Given a transaction receipt and the abi for a contract, parses and trigger the
   * corresponding events
   * @private
   * @param {*} transaction
   * @param {*} contract
   * @param {*} transactionReceipt
   * @param {string} contractAddress
   */
  _parseTransactionLogsFromReceipt(
    transaction,
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
        transaction,
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
   * @param {*} transaction
   * @param {*} contract
   * @param {*} input
   * @param {*} contractAddress
   */
  async _parseTransactionFromInput(
    transaction,
    contract,
    data,
    contractAddress,
    sender,
    status = 'pending'
  ) {
    const transactionType = this._getTransactionType(contract, data)

    transaction.status = status
    transaction.type = transactionType
    transaction.confirmations = 0

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
      return handler(transaction, contractAddress, sender, args)
    }
  }

  /**
   * The transaction is still pending: it has been sent to the network but not
   * necessarily received by the node we're asking it (and not mined...)
   * @param {*} transaction
   * @param {*} version
   * @param {object} defaults
   * @private
   */
  async _getSubmittedTransaction(transaction, version, defaults) {
    // If we have default values for the transaction's input
    if (defaults && defaults.input) {
      const contractAddress = ethers.utils.getAddress(defaults.to)
      const contract =
        this.unlockContractAddress === contractAddress
          ? version.Unlock
          : version.PublicLock

      await this._parseTransactionFromInput(
        transaction,
        contract,
        defaults.input,
        defaults.to,
        defaults.from,
        'submitted'
      )
    }

    return transaction
  }

  /**
   * This means the transaction is not in a block yet (ie. not mined), but has been propagated
   * We do not know what the transacion is about though so we need to extract its info from
   * the input.
   * @param {*} blockTransaction
   * @private
   */
  async _getPendingTransaction(transaction, version, blockTransaction) {
    const contractAddress = ethers.utils.getAddress(blockTransaction.to)
    const contract =
      this.unlockContractAddress === contractAddress
        ? version.Unlock
        : version.PublicLock

    await this._parseTransactionFromInput(
      transaction,
      contract,
      blockTransaction.data,
      blockTransaction.to,
      blockTransaction.from,
      'pending'
    )

    return transaction
  }

  /**
   * This gets a transaction by its hash and return a promise of transaction
   * Note: it returns the current state of the transaction, which may not be "final"
   * The implementing application is expected to poll if it's waiting for specific attributes
   * in the transaction.
   * There are at least 4 states for a transaction
   * 1- The node does not know about it
   * 2- The node knows about it but it has not been mined
   * 4- The node knows about it and it has been mined
   * @param {string} transactionHash
   * @param {object} filter
   */
  async getTransaction(transactionHash, defaults) {
    const [blockNumber, blockTransaction] = await Promise.all([
      this.provider.getBlockNumber(),
      this.provider.getTransaction(transactionHash),
    ])

    // Let's build the transaction object
    const transaction = {
      hash: transactionHash,
      blockNumber, // status as of block number.
    }

    if (!blockTransaction) {
      // Case 1
      // Here the node does not know about it.
      // This could either be that the node is "late" (transaction is very recent)
      // of the transaction was cancelled/dropped.

      // We assume this is a submitted transaction
      transaction.status = 'submitted'
      transaction.confirmations = 0
      // If we have defaults, we should parse them
      if (defaults) {
        let version
        const contractAddress = ethers.utils.getAddress(defaults.to)
        if (this.unlockContractAddress === contractAddress) {
          version = await this.unlockContractAbiVersion()
        } else {
          version = await this.lockContractAbiVersion(defaults.to)
        }
        return this._getSubmittedTransaction(transaction, version, defaults)
      }
      return transaction
    }

    // Here we have a block transaction , which means the node knows about it
    // Let's find the type of contract before we can get its version
    let version
    const contractAddress = ethers.utils.getAddress(blockTransaction.to)
    if (this.unlockContractAddress === contractAddress) {
      version = await this.unlockContractAbiVersion()
    } else {
      version = await this.lockContractAbiVersion(contractAddress)
    }

    // If the block number is missing the transaction has been received by the node
    // but not mined yet
    if (!blockTransaction.blockNumber) {
      return this._getPendingTransaction(transaction, version, blockTransaction)
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

    // The transaction was mined, so we should have a receipt for it
    transaction.status = 'mined'
    transaction.type = transactionType
    transaction.confirmations = Math.max(
      blockNumber - blockTransaction.blockNumber,
      0
    )
    transaction.blockNumber = blockTransaction.blockNumber
    const transactionReceipt = await this.provider.getTransactionReceipt(
      transactionHash
    )

    if (transactionReceipt) {
      // NOTE: old version of web3.js (pre 1.0.0-beta.34) are not parsing 0x0 into a falsy value
      if (!transactionReceipt.status || transactionReceipt.status == '0x0') {
        transaction.status = 'failed'
        return transaction
      }
      await this._parseTransactionLogsFromReceipt(
        transaction,
        contract,
        transactionReceipt,
        contractAddress
      )
    }
    return transaction
  }

  /**
   * Refresh the lock's data.
   * We use the block version
   * @return Promise<Lock>
   */
  async getLock(address) {
    const version = await this.lockContractAbiVersion(address)
    const lock = version.getLock.bind(this)(address)
    lock.address = address
    return lock
  }

  /**
   * Tell whether a user is a manager for the lock
   * @param {string} lock
   * @param {string} manager
   * @return Promise<boolean>
   */
  async isLockManager(lock, manager) {
    const version = await this.lockContractAbiVersion(lock)
    return version.isLockManager.bind(this)(lock, manager)
  }

  /**
   * Returns the key to the lock by the account.
   * @param {PropTypes.string} lock
   * @param {PropTypes.string} owner
   * TODO: return the tokenId here because this is probably useful in some context
   * TODO: add a method to retrieve a token by its id
   */
  async getKeyByLockForOwner(lock, owner) {
    const lockContract = await this.getLockContract(lock)
    return this._getKeyByLockForOwner(lockContract, owner).then(expiration => {
      const keyPayload = {
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
    let balance
    let decimals
    let result
    try {
      balance = await getErc20BalanceForAddress(
        contractAddress,
        userWalletAddress,
        this.provider
      )
      decimals = await getErc20Decimals(contractAddress, this.provider)
      result = utils.fromDecimal(balance, decimals)
    } catch (e) {
      this.emit('error', e)
    }
    return result
  }
}
