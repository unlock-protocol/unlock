import BlockchainHandler from './blockchainHandler/BlockchainHandler'
import {
  ConstantsType,
  BlockchainData,
  FetchWindow,
  SetTimeoutWindow,
} from './blockchainHandler/blockChainTypes'
import { isValidPaywallConfig, isAccount } from '../utils/validators'
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

export default class Mailbox {
  private useLocalStorageCache = true
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
      balance: '0',
      network: this.constants.defaultNetwork,
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
    // now that we have a valid configuration, we know which locks
    // are relevant, and can retrieve any cached data.
    // the cache is retrieved once per process, and thereafter
    // only changed when new blockchain data comes in.
    this.blockchainData = this.getBlockchainDataFromLocalStorageCache()
    this.setupStorageListener()

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
   * Retrieve the addresses of any unlocked locks
   */
  getUnlockedLockAddresses() {
    if (!this.blockchainData) return []
    const data = this.blockchainData as BlockchainData
    // lock addresses are normalized by here
    return Object.keys(data.locks).filter(lockAddress => {
      const lock = data.locks[lockAddress]
      // locked states are "none", and "expired"
      return ['valid', 'pending', 'submitted', 'confirming'].includes(
        lock.key.status
      )
    })
  }

  /**
   * When we receive PostMessages.SEND_UPDATES, it is sent here to
   * send data back to the main window
   */
  sendUpdates(updateRequest: unknown) {
    if (!this.blockchainData) return
    const unlockedLocks = this.getUnlockedLockAddresses()
    if (unlockedLocks.length) {
      this.postMessage(PostMessages.UNLOCKED, unlockedLocks)
    } else {
      this.postMessage(PostMessages.LOCKED, undefined)
    }
    const { locks, account, balance, network } = this
      .blockchainData as BlockchainData
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

  /**
   * This is called by the BlockchainHandler when there is an update to chain data
   */
  emitChanges(newData: BlockchainData) {
    this.setBlockchainData(newData)
    // TODO: don't send unchanged values
    this.postMessage(PostMessages.UPDATE_ACCOUNT, newData.account)
    this.postMessage(PostMessages.UPDATE_ACCOUNT_BALANCE, newData.balance)
    this.postMessage(PostMessages.UPDATE_NETWORK, newData.network)
    this.postMessage(PostMessages.UPDATE_LOCKS, newData.locks)
    const unlockedLocks = this.getUnlockedLockAddresses()
    if (unlockedLocks.length) {
      this.postMessage(PostMessages.UNLOCKED, unlockedLocks)
    } else {
      this.postMessage(PostMessages.LOCKED, undefined)
    }
  }

  /**
   * This is called whenever an error occurs in the data iframe
   */
  emitError(error: Error) {
    if (process.env.UNLOCK_ENV === 'dev') {
      // eslint-disable-next-line
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
      if (!blockchainData) {
        return this.defaultBlockchainData
      }
      return JSON.parse(blockchainData)
    } catch (error) {
      if (process.env.UNLOCK_ENV === 'dev') {
        // eslint-disable-next-line
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
    if (!this.localStorageAvailable) return
    if (!this.configuration) return
    try {
      this.window.localStorage.removeItem(this.getCacheKey())
    } catch (error) {
      // localStorage can throw, and getCacheKey can throw
      if (process.env.UNLOCK_ENV === 'dev') {
        // eslint-disable-next-line
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
    if (!this.localStorageAvailable) return
    if (!this.configuration) return

    const cacheableData = JSON.stringify(this.blockchainData)

    try {
      this.window.localStorage.setItem(this.getCacheKey(), cacheableData)
    } catch (error) {
      // localStorage can throw, and getCacheKey can throw
      if (process.env.UNLOCK_ENV === 'dev') {
        // eslint-disable-next-line
        this.window.console.error(error)
        // ignore errors from a UI perspective, log for development
      }
      // safety first: clear cache on *any* error
      this.window.localStorage.clear()
    }
  }
}
