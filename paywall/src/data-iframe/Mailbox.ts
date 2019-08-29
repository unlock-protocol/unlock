import BlockchainHandler from './blockchainHandler/BlockchainHandler'
import {
  ConstantsType,
  BlockchainData,
  FetchWindow,
  SetTimeoutWindow,
  KeyResults,
  KeyResult,
} from './blockchainHandler/blockChainTypes'
import {
  isValidPaywallConfig,
  isAccount,
  isValidLocks,
  isAccountOrNull,
  isValidBalance,
} from '../utils/validators'
import { PaywallConfig, PurchaseKeyRequest } from '../unlockTypes'
import {
  IframePostOfficeWindow,
  ConsoleWindow,
  LocalStorageWindow,
  EventTypes,
} from '../windowTypes'
import { waitFor } from '../utils/promises'
import { iframePostOffice, PostMessageListener } from '../utils/postOffice'
import { MessageTypes, PostMessages, ExtractPayload } from '../messageTypes'
import {
  normalizeAddressKeys,
  normalizeLockAddress,
} from '../utils/normalizeAddresses'
import localStorageAvailable from '../utils/localStorage'
import { currentTimeInSeconds } from '../utils/durations'

/**
 * BlockchainHandler uses an expiration of -1 to indicate placeholder keys
 * before we get results from the chain. We shouldn't decide whether the page
 * is locked or not until we have a real key response for each lock on the page.
 */
export const gotAllKeysFromChain = (
  keys: KeyResults,
  lockAddresses: string[]
): boolean => {
  // No lock addresses means bad or nonexistent paywall config. In any
  // event, we haven't gotten data from the chain.
  if (!lockAddresses.length) {
    return false
  }

  // Every lock address in the paywall config must have a matching key
  // (whether valid or not) for us to have gotten all data from the chain
  const haveAKeyForEachLock = lockAddresses.every(address => {
    return keys[address]
  })

  // All keys that come from web3service have `expiration` >= 0
  // So if all keys in the blockchain data satisfy that constraint, they all
  // came from web3Service
  const allKeysAreReal = Object.values(keys).every(key => key.expiration >= 0)

  return haveAKeyForEachLock && allKeysAreReal
}

// This enum is only used internal to the Mailbox. A boolean won't do because
// there is a state where we are neither locked nor unlocked because we don't
// have all the data from the chain yet.
export enum PaywallStatus {
  locked = 'LOCKED',
  unlocked = 'UNLOCKED',
  none = 'NONE',
}

export const isUnexpired = ({ expiration }: KeyResult) => {
  return expiration > currentTimeInSeconds()
}

export const getPaywallStatus = (
  keys: KeyResults,
  lockAddresses: string[]
): PaywallStatus => {
  // No lock addresses means bad or nonexistent paywall config. In any
  // event, we can't say the paywall is locked or unlocked.
  if (!lockAddresses.length) {
    return PaywallStatus.none
  }

  // Check the keys first, because if there is a single valid key we can
  // unlock even if we haven't gotten all keys from the blockchain
  const anyKeyIsUnexpired = Object.values(keys).some(isUnexpired)
  if (anyKeyIsUnexpired) {
    return PaywallStatus.unlocked
  }

  // Too soon for us to say definitively that the page is locked
  if (!gotAllKeysFromChain(keys, lockAddresses)) {
    return PaywallStatus.none
  }

  // No valid keys, lock the page
  return PaywallStatus.locked
}

export const getUnlockedLockAddresses = (keys: KeyResults): string[] => {
  const unexpiredKeys = Object.values(keys).filter(isUnexpired)
  return unexpiredKeys.map(k => k.lock)
}

export default class Mailbox {
  private readonly useLocalStorageCache = false
  private readonly cachePrefix = '__unlockProtocol.cache'
  private handler?: BlockchainHandler
  private constants: ConstantsType
  private configuration?: PaywallConfig
  private window: FetchWindow &
    SetTimeoutWindow &
    IframePostOfficeWindow &
    ConsoleWindow &
    LocalStorageWindow
  private postMessage: (
    type: MessageTypes,
    payload: ExtractPayload<MessageTypes>
  ) => void = () => {}
  private addPostMessageListener: <T extends PostMessages = PostMessages>(
    type: T,
    listener: PostMessageListener
  ) => void = () => {}
  private blockchainData: BlockchainData
  private readonly defaultBlockchainData: BlockchainData
  private readonly localStorageAvailable: boolean
  constructor(
    constants: ConstantsType,
    window: FetchWindow &
      SetTimeoutWindow &
      IframePostOfficeWindow &
      ConsoleWindow &
      LocalStorageWindow
  ) {
    this.constants = constants
    this.window = window
    this.localStorageAvailable = localStorageAvailable(window)
    this.setConfig = this.setConfig.bind(this)
    this.sendUpdates = this.sendUpdates.bind(this)
    this.purchaseKey = this.purchaseKey.bind(this)
    this.refreshBlockchainTransactions = this.refreshBlockchainTransactions.bind(
      this
    )
    this.emitChanges = this.emitChanges.bind(this)
    this.emitError = this.emitError.bind(this)
    const { postMessage, addHandler } = iframePostOffice(
      this.window,
      'data iframe'
    )
    this.postMessage = postMessage
    this.addPostMessageListener = addHandler
    this.defaultBlockchainData = {
      locks: {},
      account: null,
      balance: {
        eth: '0',
      },
      network: this.constants.defaultNetwork,
      keys: {},
      transactions: {},
    }
    // set the defaults
    this.blockchainData = this.defaultBlockchainData
    this.setupPostMessageListeners()
  }

  setupPostMessageListeners() {
    this.addPostMessageListener(PostMessages.CONFIG, this.setConfig)
    this.addPostMessageListener(PostMessages.SEND_UPDATES, this.sendUpdates)
    this.addPostMessageListener(PostMessages.PURCHASE_KEY, this.purchaseKey)
    this.addPostMessageListener(
      PostMessages.INITIATED_TRANSACTION,
      this.refreshBlockchainTransactions
    )
    this.postMessage(PostMessages.READY, undefined)
  }

  /**
   * We can use this to determine whether the user has purchased a key in another tab
   */
  setupStorageListener() {
    if (!this.useLocalStorageCache) return
    // TODO: check to see if there are any changes to the keys and don't retrieve if not
    // Issues that reference this: #4381 #4411
    this.window.addEventListener(EventTypes.STORAGE, event => {
      if (!this.configuration || !this.handler) return
      if (event.key === this.getCacheKey()) {
        // another tab has done something that affects our data, so
        // let's refetch
        this.handler.retrieveCurrentBlockchainData()
      }
    })
  }

  async init() {
    // lazy-loading the blockchain handler, this is essential to implement
    // code splitting
    const [
      {
        default: Web3ProxyProvider,
      } /* import('../../providers/Web3ProxyProvider') */,
      {
        default: BlockchainHandler,
        WalletService,
        Web3Service,
      } /* './blockchainHandler/BlockchainHandler' */,
    ] = await Promise.all([
      import('../providers/Web3ProxyProvider'),
      import('./blockchainHandler/BlockchainHandler'),
    ])

    const web3Service = new Web3Service(this.constants)
    const walletService = new WalletService(this.constants)
    const provider = new Web3ProxyProvider(this.window)

    // configuration is set by "setConfig" in response to "READY"
    // it is the paywall configuration
    await waitFor(() => this.configuration)

    // we do not need a connected walletService to work
    walletService.connect(provider).catch((e: Error) => {
      this.emitError(e)
    })

    this.handler = new BlockchainHandler({
      web3Service,
      walletService,
      constants: this.constants,
      configuration: this.configuration as PaywallConfig,
      emitChanges: this.emitChanges,
      emitError: this.emitError,
      window: this.window,
    })
    this.handler.init()
    this.handler.retrieveCurrentBlockchainData()
  }

  /**
   * When we receive PostMessages.SEND_UPDATES, it is sent here to
   * send data back to the main window
   */
  sendUpdates(updateRequest: unknown) {
    if (!this.blockchainData) return

    const { locks, account, balance, network, keys } = this
      .blockchainData as BlockchainData
    const configLockAddresses: string[] =
      (this.configuration && Object.keys(this.configuration.locks)) || []

    const paywallStatus = getPaywallStatus(keys, configLockAddresses)

    switch (paywallStatus) {
      case PaywallStatus.unlocked: {
        const unlockedLocks = getUnlockedLockAddresses(keys)
        this.postMessage(PostMessages.UNLOCKED, unlockedLocks)
        break
      }
      case PaywallStatus.locked: {
        this.postMessage(PostMessages.LOCKED, undefined)
        break
      }
    }

    const type = updateRequest as 'locks' | 'account' | 'balance' | 'network'
    switch (type) {
      case 'locks':
        this.postMessage(PostMessages.UPDATE_LOCKS, locks)
        break
      case 'account':
        this.postMessage(PostMessages.UPDATE_ACCOUNT, account)
        break
      case 'balance':
        this.postMessage(PostMessages.UPDATE_ACCOUNT_BALANCE, balance)
        break
      case 'network':
        this.postMessage(PostMessages.UPDATE_NETWORK, network)
        break
      default:
        this.emitError(
          new Error(
            `Unknown update requested: ${
              typeof type === 'string' ? '"' + type + '"' : '<invalid value>'
            }`
          )
        )
    }
  }

  /**
   * When we receive PostMessages.CONFIG, it is sent here to
   * validate and then set configuration
   */
  setConfig(config: unknown) {
    if (!isValidPaywallConfig(config)) {
      this.emitError(
        new Error('Invalid paywall configuration, cannot continue')
      )
      return
    }

    // ensure the lock addresses are normalized before setting it
    ;(config as PaywallConfig).locks = normalizeAddressKeys(
      (config as PaywallConfig).locks
    )
    this.configuration = config as PaywallConfig
    // now that we have a valid configuration, we know which locks
    // are relevant, and can retrieve any cached data.
    // the cache is retrieved once per process, and thereafter
    // only changed when new blockchain data comes in.
    this.blockchainData = this.getBlockchainDataFromLocalStorageCache()
    this.setupStorageListener()
  }

  /**
   * When we receive PostMessages.PURCHASE_KEY, it is sent here to
   * do the purchase
   */
  purchaseKey(request: unknown) {
    if (!this.handler || !this.blockchainData) return
    if (
      !request ||
      !(request as PurchaseKeyRequest).lock ||
      !(request as PurchaseKeyRequest).extraTip ||
      !isAccount((request as PurchaseKeyRequest).lock) ||
      normalizeLockAddress((request as PurchaseKeyRequest).lock) !==
        (request as PurchaseKeyRequest).lock
    ) {
      this.emitError(new Error('Cannot purchase, malformed request'))
      return
    }
    // format is validated here
    const details: PurchaseKeyRequest = request as PurchaseKeyRequest
    // lock addresses are normalized
    const data = this.blockchainData as BlockchainData
    if (!data.locks[details.lock]) {
      this.emitError(
        new Error(`Cannot purchase key on unknown lock: "${details.lock}"`)
      )
      return
    }
    const lock = data.locks[details.lock]

    // this catches its errors internally and emits them with "emitError" (below)
    this.handler.purchaseKey({
      lockAddress: details.lock,
      amountToSend: lock.keyPrice,
      erc20Address: lock.currencyContractAddress,
    })
  }

  /**
   * When we receive PostMessages.INITIATED_TRANSACTION, it is sent here
   * to request a new set of transactions
   */
  refreshBlockchainTransactions() {
    // this next condition is unlikely, but technically possible
    if (!this.handler) return
    // a key purchase was triggered elsewhere,
    // so retrieve the pending purchase's transaction
    this.handler.retrieveTransactions()
  }

  getDataToSend(newData: BlockchainData) {
    const oldChainData = this.blockchainData
    this.setBlockchainData(newData)
    // check to see if cache is present while locks are not yet ready
    const cachedLocksSize = Object.keys(oldChainData.locks).length
    const newLocksSize = Object.keys(newData.locks).length
    if (newLocksSize < cachedLocksSize) {
      if (process.env.DEBUG) {
        this.window.console.log('[CACHE] using cached values')
      }
      // continue to use the cache until the data is ready
      this.blockchainData = oldChainData
    }
    const dataToSend = newLocksSize >= cachedLocksSize ? newData : oldChainData
    return dataToSend
  }

  /**
   * This is called by the BlockchainHandler when there is an update to chain data
   */
  emitChanges(newData: BlockchainData) {
    const { keys, transactions } = newData
    const dataToSend = this.getDataToSend(newData)
    // TODO: don't send unchanged values
    this.postMessage(PostMessages.UPDATE_ACCOUNT, dataToSend.account)
    this.postMessage(PostMessages.UPDATE_ACCOUNT_BALANCE, dataToSend.balance)
    this.postMessage(PostMessages.UPDATE_NETWORK, dataToSend.network)
    this.postMessage(PostMessages.UPDATE_LOCKS, dataToSend.locks)
    this.postMessage(PostMessages.UPDATE_KEYS, keys)
    this.postMessage(PostMessages.UPDATE_TRANSACTIONS, transactions)

    const configLockAddresses: string[] =
      (this.configuration && Object.keys(this.configuration.locks)) || []
    const paywallStatus = getPaywallStatus(keys, configLockAddresses)

    switch (paywallStatus) {
      case PaywallStatus.unlocked: {
        const unlockedLocks = getUnlockedLockAddresses(keys)
        this.postMessage(PostMessages.UNLOCKED, unlockedLocks)
        break
      }
      case PaywallStatus.locked: {
        this.postMessage(PostMessages.LOCKED, undefined)
        break
      }
    }
  }

  /**
   * This is called whenever an error occurs in the data iframe
   */
  emitError(error: Error) {
    if (process.env.UNLOCK_ENV === 'dev') {
      this.window.console.error(error)
    }
    this.postMessage(PostMessages.ERROR, error.message)
  }

  /**
   * Save the blockchain data in-memory, and also in localStorage if available
   */
  setBlockchainData(data: BlockchainData) {
    this.blockchainData = data
    if (this.useLocalStorageCache) {
      this.saveCacheInLocalStorage()
    }
  }

  /**
   * Validate the incoming cache. If it is invalid, clear localStorage and return defaults
   */
  sanitizeBlockchainData(data: unknown) {
    const nukeAndReturn = () => {
      this.window.localStorage.clear()
      return this.defaultBlockchainData
    }
    if (!data) return nukeAndReturn()
    if (typeof data !== 'object') return nukeAndReturn()
    const chainData = data as BlockchainData
    const keys = Object.keys(chainData)
    if (keys.length !== Object.keys(this.defaultBlockchainData).length) {
      return nukeAndReturn()
    }
    if (
      keys.filter(
        key =>
          ![
            'locks',
            'account',
            'balance',
            'network',
            'keys',
            'transactions',
          ].includes(key)
      ).length
    ) {
      return nukeAndReturn()
    }
    if (
      !isValidLocks(chainData.locks) ||
      !isAccountOrNull(chainData.account) ||
      ![1, 4, 1984].includes(chainData.network) ||
      !isValidBalance(chainData.balance)
    ) {
      return nukeAndReturn()
    }
    return chainData
  }

  /**
   * This either retrieves the cache, or returns a fresh value
   *
   * All error conditions result in obliteration of the entire localStorage cache
   * out of an abundance of caution.
   *
   * The cache is indexed by the configuration locks, so that we have separate caches
   * for every paywall configuration
   */
  getBlockchainDataFromLocalStorageCache(): BlockchainData {
    if (!this.localStorageAvailable) return this.defaultBlockchainData

    try {
      const blockchainData = this.window.localStorage.getItem(
        this.getCacheKey()
      )
      if (process.env.DEBUG) {
        this.window.console.log('[CACHE] got', blockchainData)
      }
      if (!blockchainData) {
        return this.defaultBlockchainData
      }
      return this.sanitizeBlockchainData(JSON.parse(blockchainData))
    } catch (error) {
      if (process.env.UNLOCK_ENV === 'dev') {
        this.window.console.error(error)
        // ignore errors from a UI perspective, log for development
      }
      // invalidate on any error
      this.window.localStorage.clear()
      return this.defaultBlockchainData
    }
  }

  /**
   * The cache is indexed by a sorted list of lock addresses converted to JSON and normalized to lower-case
   */
  getCacheKey() {
    if (!this.configuration) {
      // this should never happen, and is a guard against crash bugs
      throw new Error(
        'internal error: cannot retrieve cache without configuration'
      )
    }
    const configKey = JSON.stringify(
      Object.keys(this.configuration.locks).sort()
    ).toLowerCase()
    return this.cachePrefix + configKey
  }

  /**
   * This clears only the current paywall's cache. if there is any error thrown,
   * the whole cache is cleared out of an abundance of caution.
   */
  invalidateLocalStorageCache() {
    if (!this.localStorageAvailable || !this.useLocalStorageCache) return
    if (!this.configuration) return
    try {
      this.window.localStorage.removeItem(this.getCacheKey())
    } catch (error) {
      // localStorage can throw, and getCacheKey can throw
      if (process.env.UNLOCK_ENV === 'dev') {
        this.window.console.error(error)
        // ignore errors from a UI perspective, log for development
      }
      // safety first: clear entire cache on *any* error
      this.window.localStorage.clear()
    }
  }

  /**
   * This is performed every time we get an update from the BlockchainHandler
   *
   * On any errors, the entire localStorage is cleared out of an abundance of caution.
   */
  saveCacheInLocalStorage() {
    if (!this.localStorageAvailable || !this.useLocalStorageCache) return
    if (!this.configuration) return

    const cacheableData = JSON.stringify(this.blockchainData)

    try {
      this.window.localStorage.setItem(this.getCacheKey(), cacheableData)
    } catch (error) {
      // localStorage can throw, and getCacheKey can throw
      if (process.env.UNLOCK_ENV === 'dev') {
        this.window.console.error(error)
        // ignore errors from a UI perspective, log for development
      }
      // safety first: clear cache on *any* error
      this.window.localStorage.clear()
    }
  }
}
