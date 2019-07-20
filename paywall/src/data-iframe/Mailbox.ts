import BlockchainHandler from './blockchainHandler/BlockchainHandler'
import {
  ConstantsType,
  BlockchainData,
  FetchWindow,
  SetTimeoutWindow,
} from './blockchainHandler/blockChainTypes'
import { isValidPaywallConfig, isAccount } from '../utils/validators'
import { PaywallConfig, PurchaseKeyRequest } from '../unlockTypes'
import { IframePostOfficeWindow, ConsoleWindow } from '../windowTypes'
import { waitFor } from '../utils/promises'
import { iframePostOffice, PostMessageListener } from '../utils/postOffice'
import { MessageTypes, PostMessages, ExtractPayload } from '../messageTypes'
import {
  normalizeAddressKeys,
  normalizeLockAddress,
} from '../utils/normalizeAddresses'

export default class Mailbox {
  private handler?: BlockchainHandler
  private constants: ConstantsType
  private configuration?: PaywallConfig
  private window: FetchWindow &
    SetTimeoutWindow &
    IframePostOfficeWindow &
    ConsoleWindow
  private postMessage: (
    type: MessageTypes,
    payload: ExtractPayload<MessageTypes>
  ) => void = () => {}
  private addPostMessageListener: <T extends PostMessages = PostMessages>(
    type: T,
    listener: PostMessageListener
  ) => void = () => {}
  private blockchainData?: BlockchainData
  constructor(
    constants: ConstantsType,
    window: FetchWindow &
      SetTimeoutWindow &
      IframePostOfficeWindow &
      ConsoleWindow
  ) {
    this.constants = constants
    this.window = window
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
   * Retrieve the addresses of any unlocked locks
   */
  getUnlockedLockAddresses() {
    if (!this.getBlockchainData()) return []
    const data = this.getBlockchainData() as BlockchainData
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
    if (!this.getBlockchainData()) return
    const unlockedLocks = this.getUnlockedLockAddresses()
    if (unlockedLocks.length) {
      this.postMessage(PostMessages.UNLOCKED, unlockedLocks)
    } else {
      this.postMessage(PostMessages.LOCKED, undefined)
    }
    const {
      locks,
      account,
      balance,
      network,
    } = this.getBlockchainData() as BlockchainData
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
    if (!this.handler || !this.getBlockchainData()) return
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
    const data = this.getBlockchainData() as BlockchainData
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
    // TODO: cache values
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

  getBlockchainData(): BlockchainData | undefined {
    return this.blockchainData
  }

  setBlockchainData(data: BlockchainData) {
    this.blockchainData = data
  }
}
