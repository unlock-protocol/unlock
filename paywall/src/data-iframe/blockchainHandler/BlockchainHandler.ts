import { Web3Service, WalletService } from '@unlock-protocol/unlock-js'
import {
  PaywallConfig,
  Transactions,
  Locks,
  TransactionType,
  TransactionStatus,
} from '../../unlockTypes'
import linkKeysToLocks from './linkKeysToLocks'
import { POLLING_INTERVAL } from '../../constants'
import {
  KeyResults,
  KeyResult,
  WalletServiceType,
  Web3ServiceType,
  ConstantsType,
  BlockchainData,
  LocksmithTransactionsResult,
  TransactionDefaults,
  FetchWindow,
  PaywallState,
  SetTimeoutWindow,
  unlockNetworks,
} from './blockChainTypes'
import {
  normalizeAddressKeys,
  normalizeLockAddress,
} from '../../utils/normalizeAddresses'
import { createTemporaryKey } from './createTemporaryKey'

/**
 * Make empty keys for the current account
 */
export function makeDefaultKeys(
  lockAddresses: string[],
  account: string | null
): KeyResults {
  return lockAddresses.reduce((allKeys: KeyResults, address: string) => {
    allKeys[address] = {
      lock: address,
      owner: account,
      // Negative expiration is not valid. This is a hack to distinguish
      // "default" keys from keys returned from Web3Service. In the long term we
      // will remove the idea of "default" keys because they cause a lot of
      // problems.
      expiration: -1,
    }
    return allKeys
  }, {})
}

interface BlockchainHandlerParams {
  walletService: WalletServiceType
  web3Service: Web3ServiceType
  constants: ConstantsType
  configuration: PaywallConfig
  emitChanges: (data: BlockchainData) => void
  emitError: (error: Error) => void
  window: FetchWindow & SetTimeoutWindow
  store?: PaywallState
}

// TODO: Why do we export these???
export { Web3Service, WalletService }

// assumptions:
// 1. walletService has been "connected" to the Web3ProxyProvider
// 2. config has been validated already
// 3. emitChanges will pass along the updates to the main window
// 3. emitError will pass along the error to the main window
export default class BlockchainHandler {
  private walletService: WalletServiceType
  private web3Service: Web3ServiceType
  private constants: ConstantsType
  private emitChanges: (data: BlockchainData) => void
  private emitError: (error: Error) => void
  private window: FetchWindow & SetTimeoutWindow
  private store: PaywallState
  private lockAddresses: string[]

  constructor({
    walletService,
    web3Service,
    constants,
    configuration,
    emitChanges,
    emitError,
    window,
    store = {
      config: {
        locks: {},
        callToAction: { default: '', expired: '', pending: '', confirmed: '' },
      },
      account: null,
      balance: {
        eth: '0',
      },
      keys: {},
      locks: {},
      transactions: {},
      network: 1,
    },
  }: BlockchainHandlerParams) {
    this.walletService = walletService
    this.web3Service = web3Service
    this.constants = constants
    this.emitChanges = emitChanges
    this.emitError = emitError
    this.window = window

    // set the actual defaults
    store.config = configuration
    store.network = constants.defaultNetwork
    // take the paywall config, normalize all the locks (this is redundant for safety)
    store.config.locks = normalizeAddressKeys(store.config.locks)
    // this will be used to filter the keys and transactions we return
    this.lockAddresses = Object.keys(store.config.locks)
    // set the default keys now
    store.keys = makeDefaultKeys(this.lockAddresses, store.account)
    this.store = store
  }

  /**
   * Initialize non-constant work
   *
   * Polling for accounts, setting up listeners, fetching locks happen here
   */
  init() {
    // set up event listeners
    this.setupListeners()

    // retrieve the locks
    this.lockAddresses.forEach(address =>
      this.web3Service.getLock(address).catch(error => this.emitError(error))
    )

    // poll for account changes
    const retrieveAccount = () => {
      if (!this.walletService.provider) return
      this.walletService.getAccount().catch(error => this.emitError(error))
    }
    const pollForAccountChanges = () => {
      retrieveAccount()
      this.window.setTimeout(pollForAccountChanges, POLLING_INTERVAL)
    }
    pollForAccountChanges()
  }

  /**
   * This is the callback used to purchase a key
   */
  async purchaseKey({
    lockAddress,
    amountToSend,
    erc20Address,
  }: {
    lockAddress: string
    amountToSend: string
    erc20Address: string | null
  }) {
    if (!this.store.account) return
    const account = this.store.account as string

    // Support the currency!
    return this.walletService.purchaseKey(
      lockAddress,
      account,
      amountToSend,
      null /* account */, // THIS FIELD HAS BEEN DEPRECATED AND WILL BE IGNORED
      null /* data */, // THIS FIELD HAS BEEN DEPRECATED AND WILL BE IGNORED
      erc20Address
    )
  }

  /**
   * used to retrieve new values from the chain
   *
   * Values retrieved are dispatched back to the main window in event listeners
   */
  async retrieveCurrentBlockchainData() {
    // set up any missing keys prior to retrieval
    const defaultKeys = makeDefaultKeys(this.lockAddresses, this.store.account)
    this.lockAddresses.forEach(address => {
      if (!this.store.keys[address]) {
        this.store.keys[address] = defaultKeys[address]
      }
    })

    if (this.store.account === null) {
      // no account, we need to obliterate all existing keys and transactions and balance
      this.store.keys = makeDefaultKeys(this.lockAddresses, this.store.account)
      this.store.transactions = {}
      this.store.balance = {
        eth: '0',
      }
      this.dispatchChangesToPostOffice()
      return
    }
    // first get keys
    this.lockAddresses.map(address => {
      return this.web3Service
        .getKeyByLockForOwner(address, this.store.account as string)
        .catch(error => this.emitError(error))
    })

    // no locks, no transactions can exist
    if (!this.lockAddresses.length) return
    // then transactions
    this.retrieveTransactions()
  }

  /**
   * Dispatch values back to the post office
   */
  async dispatchChangesToPostOffice() {
    const fullLocks: Locks = await linkKeysToLocks({
      locks: this.store.locks,
      keys: this.store.keys,
      transactions: this.store.transactions,
      requiredConfirmations: this.constants.requiredConfirmations,
    })
    this.emitChanges({
      locks: fullLocks,
      account: this.store.account,
      balance: this.store.balance,
      network: this.store.network,
      keys: this.store.keys,
      transactions: this.store.transactions,
    })
  }

  /**
   * Manage triggering send of data when keys expire
   */
  sendDataWhenKeyExpires(expiry: number) {
    // a key with no expiry yet does not need an expiration trigger
    if (!expiry) return
    const now = new Date().getTime() / 1000
    const timeToExpirationInSeconds = expiry - now
    const timeToExpirationInMilliseconds = timeToExpirationInSeconds * 1000

    if (timeToExpirationInSeconds <= 0) {
      // key is expired already
      // as this is called by the key.updated listener, it will
      // dispatch changes.  If that ever changes, we need to
      // call dispatchChangesToPostOffice() here
      return
    }

    // 1 second after the key expires, re-send data to lock the paywall
    this.window.setTimeout(
      () => this.dispatchChangesToPostOffice(),
      timeToExpirationInMilliseconds + 1000
    )
  }

  /**
   * Account was changed in walletService
   * @private
   * @param newAccount string
   */
  _onAccountChanged(newAccount: string) {
    if (newAccount === this.store.account) return
    this.store.account = newAccount
    this._reset()
  }

  /**
   * Network was changed in walletService
   * @private
   * @param networkId
   */
  _onNetworkChanged(networkId: unlockNetworks) {
    if (networkId === this.store.network) return
    this.store.network = networkId
    this._reset()
  }

  /**
   * Account was updated
   * @private
   * @param account
   * @param update
   */
  _onAccountUpdated(account: { address: string } | null, update: any) {
    const balance = update.balance as string
    const address = account && account.address
    if (address !== this.store.account) return
    if (balance === this.store.balance.ether) return
    this.store.balance = {
      eth: balance,
    }
    this.dispatchChangesToPostOffice()
  }

  /**
   * Key was updated
   * @private
   * @param _
   * @param key
   */
  _onKeyUpdated(_: any, key: KeyResult) {
    key.lock = normalizeLockAddress(key.lock)
    this.store.keys[key.lock] = key
    this.sendDataWhenKeyExpires(key.expiration)
    // note: if this next line is ever removed, it will need to be
    // added inside sendDataWhenKeyExpires() to ensure expired
    // key information is sent to the post office
    this.dispatchChangesToPostOffice()
  }

  /**
   * When transaction was updated
   * @private
   * @param hash
   * @param update
   */
  _onTransactionUpdated(hash: string, update: any) {
    if (update.lock) {
      // ensure all references to locks are normalized
      update.lock = normalizeLockAddress(update.lock)
    }
    if (update.to) {
      // ensure all references to locks are normalized
      update.to = normalizeLockAddress(update.to)
    }
    this._mergeUpdate(
      hash,
      'transactions',
      {
        hash,
        blockNumber: Number.MAX_SAFE_INTEGER,
        status: 'submitted',
      },
      update
    )
    const transaction = this.store.transactions[hash]
    const isMined = transaction.status === TransactionStatus.MINED
    const recipient = transaction.lock || transaction.to
    const isKeyPurchase = transaction.type === TransactionType.KEY_PURCHASE
    const accountAddress = this.store.account as string

    // If we receive a mined key purchase, we should query web3Service for the
    // real key
    if (isKeyPurchase && recipient && isMined) {
      this.web3Service.getKeyByLockForOwner(recipient, accountAddress)
    }

    // If we receive a submitted or pending key purchase we should
    // create and store a temporary key.
    if (isKeyPurchase && recipient && !isMined) {
      const lock = this.store.locks[recipient]
      const temporaryKey = createTemporaryKey(recipient, accountAddress, lock)
      this.store.keys[recipient] = temporaryKey
    }
  }

  /**
   * When the lock was updated
   * @param lockAddress
   * @param update
   */
  async _onLockUpdated(lockAddress: string, update: any) {
    const address = normalizeLockAddress(lockAddress)
    if (update.address) {
      update.address = normalizeLockAddress(update.address)
    }
    if (this.store.config.locks[address].name) {
      // use the configuration lock name if present
      update.name = this.store.config.locks[address].name
    }

    // If the lock is in a non ethereum currency, we need to get the balance of currency for that user
    if (update.currencyContractAddress && this.store.account) {
      const balance = await this.web3Service.getTokenBalance(
        update.currencyContractAddress,
        this.store.account
      )
      this.store.balance[update.currencyContractAddress] = balance
      this.dispatchChangesToPostOffice()
    }

    this._mergeUpdate(
      address,
      'locks',
      {
        address,
      },
      update
    )
  }

  /**
   * Mostly used for key purchases
   * @private
   * @param hash
   * @param from
   * @param to
   * @param input
   * @param type
   * @param status
   */
  _onTransactionNew(
    hash: string,
    from: string,
    to: string,
    input: string,
    type: string,
    status: string
  ) {
    // when purchasing directly, who we purchase the key "for" is
    // also whose wallet the funds came "from"
    // TODO normalize *all* addresses
    const normalizedTo = normalizeLockAddress(to)
    const newTransaction: TransactionDefaults = {
      hash,
      from,
      for: from,
      to: normalizedTo,
      input,
      type,
      status,
      blockNumber: Number.MAX_SAFE_INTEGER,
    }

    const accountAddress = this.store.account as string
    const isKeyPurchase = type === TransactionType.KEY_PURCHASE
    // We may not have to check for this, because we should
    // receive `transaction.new` long before the transaction is
    // mined
    const isMined = status === TransactionStatus.MINED

    // We submitted a key purchase transaction. Create and store a
    // temporary key until the transaction gets mined.
    if (isKeyPurchase && !isMined) {
      const lock = this.store.locks[normalizedTo]
      const temporaryKey = createTemporaryKey(
        normalizedTo,
        accountAddress,
        lock
      )
      this.store.keys[normalizedTo] = temporaryKey
    }

    this.storeTransaction(newTransaction)
    this._mergeUpdate(hash, 'transactions', newTransaction, {
      key: `${to}-${from}`,
      lock: newTransaction.to,
      confirmations: 0,
      network: this.store.network,
    })
    // start polling
    this.web3Service.getTransaction(hash)
  }

  /**
   * @private
   * @param error
   */
  _onError(error: any) {
    if (error.message === 'FAILED_TO_PURCHASE_KEY') {
      this.emitError(new Error('purchase failed'))
      // TODO: which purchase failed? unlock-js needs to provide this information
      // for now, we will kill all submitted transactions and re-fetch
      this.store.transactions = Object.keys(this.store.transactions)
        .filter(hash => this.store.transactions[hash].status !== 'submitted')
        .reduce(
          (allTransactions: Transactions, hash) => ({
            ...allTransactions,
            [hash]: this.store.transactions[hash],
          }),
          {}
        )
      this.retrieveCurrentBlockchainData()
    }
  }

  /**
   * Set up the event listeners on walletService and web3Service
   */
  setupListeners() {
    // the event listeners propagate changes to the main window
    // or fetch new data when network or account changes
    this.walletService.on('account.changed', this._onAccountChanged.bind(this))

    this.walletService.on('network.changed', this._onNetworkChanged.bind(this))

    this.web3Service.on('account.updated', this._onAccountUpdated.bind(this))

    this.web3Service.on('key.updated', this._onKeyUpdated.bind(this))

    this.web3Service.on(
      'transaction.updated',
      this._onTransactionUpdated.bind(this)
    )

    this.web3Service.on('lock.updated', this._onLockUpdated.bind(this))

    this.walletService.on('transaction.new', this._onTransactionNew.bind(this))

    this.walletService.on('error', this._onError.bind(this))
  }

  /**
   * Get relevant transactions to retrieve from Locksmith and pull their details off chain
   */
  async retrieveTransactions() {
    if (!this.store.account) return
    // filter the transactions we request to only include the
    // transactions relevant to locks. In most cases this will be
    // key purchases
    const filterLocks = this.lockAddresses
      .map(lockAddress => `recipient[]=${encodeURIComponent(lockAddress)}`)
      .join('&')

    const url = `${this.constants.locksmithHost}/transactions?for=${this.store.account}&${filterLocks}`

    const response = await this.window.fetch(url)
    const result: {
      transactions?: LocksmithTransactionsResult[]
    } = await response.json()
    if (result.transactions) {
      result.transactions
        .map(t => ({
          hash: t.transactionHash,
          network: t.chain,
          to: t.recipient,
          input: t.data,
          from: t.sender,
          for: t.for,
        }))
        .filter(transaction => transaction.network === this.store.network)
        .map((transaction: TransactionDefaults) => {
          // we pass the transaction as defaults if it has input set, so that we can
          // parse out the transaction type and other details. If input is not set,
          // we can't safely pass the transaction default
          this.web3Service
            .getTransaction(
              transaction.hash,
              transaction.input ? transaction : undefined
            )
            .catch(error => this.emitError(error))
        })
    }
  }

  /**
   * Store a new key purchase transaction in locksmith
   */
  async storeTransaction(transaction: TransactionDefaults) {
    if (!this.store.account) return
    const account = this.store.account
    const network = this.store.network
    // we use the transaction lock as the recipient
    const recipient = transaction.lock || transaction.to

    const url = `${this.constants.locksmithHost}/transaction`

    const payload = {
      transactionHash: transaction.hash,
      sender: account,
      // when purchasing directly, who we purchase the key "for" is
      // also the "sender" whose wallet the funds came from
      for: account,
      recipient,
      data: transaction.input,
      chain: network,
    }
    try {
      await this.window.fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      // we don't pass this error along because it is a non-essential feature
      // eslint-disable-next-line no-console
      console.log('unable to save key purchase transaction')
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  /**
   * Merges the store values
   * @private
   * @param key
   * @param type
   * @param defaults
   * @param update
   */
  _mergeUpdate(
    key: string,
    type: 'transactions' | 'locks',
    defaults: Object,
    update: Object = {}
  ) {
    const initialValue = this.store[type][key] || defaults

    this.store[type][key] = {
      ...initialValue,
      ...update,
    }
    this.dispatchChangesToPostOffice()
  }

  /**
   * Resets the store
   * @private
   */
  _reset() {
    // we must have keys for every lock at all times
    this.store.keys = makeDefaultKeys(this.lockAddresses, this.store.account)
    this.store.transactions = {}
    if (this.store.account) {
      this.web3Service.refreshAccountBalance({ address: this.store.account })
    }
    this.retrieveCurrentBlockchainData()
    this.dispatchChangesToPostOffice()
  }
}
