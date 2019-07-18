import BlockchainHandler from './blockchainHandler/BlockchainHandler'
import {
  ConstantsType,
  BlockchainData,
  FetchWindow,
  SetTimeoutWindow,
} from './blockchainHandler/blockChainTypes'
import { isValidPaywallConfig } from '../utils/validators'
import { PaywallConfig, PurchaseKeyRequest } from '../unlockTypes'
import { IframePostOfficeWindow } from '../windowTypes'
import { waitFor } from '../utils/promises'
import { iframePostOffice, PostMessageListener } from '../utils/postOffice'
import { MessageTypes, PostMessages, ExtractPayload } from '../messageTypes'
import { normalizeAddressKeys } from '../utils/normalizeAddresses'

export default class Mailbox {
  private handler?: BlockchainHandler
  private constants: ConstantsType
  private configuration?: PaywallConfig
  private window: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  private postMessage: (
    type: MessageTypes,
    payload: ExtractPayload<MessageTypes>
  ) => void
  private addPostMessageListener: (
    type: string,
    listener: PostMessageListener
  ) => void
  private data?: BlockchainData
  constructor(
    constants: ConstantsType,
    window: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  ) {
    this.constants = constants
    this.window = window
    const { postMessage, addHandler } = iframePostOffice(
      this.window,
      'data iframe'
    )
    this.postMessage = postMessage
    this.addPostMessageListener = addHandler
    this.setConfig = this.setConfig.bind(this)
    this.sendUpdates = this.sendUpdates.bind(this)
    this.purchaseKey = this.purchaseKey.bind(this)
    this.emitChanges = this.emitChanges.bind(this)
    this.emitError = this.emitError.bind(this)
  }

  async init() {
    this.setupPostMessageListeners()
    // lazy-loading the blockchain handler, this is essential to implement
    // code splitting
    const [
      {
        default: Web3ProxyProvider,
      } /* import('../../providers/Web3ProxyProvider') */,
      {
        default: BlockchainHandlerClass,
      } /* './blockchainHandler/BlockchainHandler' */,
      { WalletService, Web3Service } /* import('@unlock-protocol/unlock-js') */,
    ] = await Promise.all([
      import('../providers/Web3ProxyProvider'),
      import('./blockchainHandler/BlockchainHandler'),
      import('@unlock-protocol/unlock-js'),
    ])

    const web3Service = new Web3Service(this.constants)
    const walletService = new WalletService(this.constants)
    const provider = new Web3ProxyProvider(this.window)
    await walletService.connect(provider)

    await waitFor(() => this.configuration)

    this.handler = new BlockchainHandlerClass({
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

  setupPostMessageListeners() {
    this.addPostMessageListener(PostMessages.CONFIG, this.setConfig)
    this.addPostMessageListener(PostMessages.SEND_UPDATES, this.sendUpdates)
    this.addPostMessageListener(PostMessages.PURCHASE_KEY, this.purchaseKey)
    this.postMessage(PostMessages.READY, undefined)
  }

  getUnlockedLockAddresses() {
    if (!this.configuration) return []
    if (!this.data) return []
    const data = this.data as BlockchainData
    return Object.keys(this.configuration.locks).filter(lockAddress => {
      const lock = data.locks[lockAddress]
      if (!lock) return false
      return ['valid', 'pending', 'submitted', 'confirming'].includes(
        lock.key.status
      )
    })
  }

  sendUpdates(type: 'locks' | 'account' | 'balance' | 'network') {
    if (!this.data) return
    const unlockedLocks = this.getUnlockedLockAddresses()
    if (unlockedLocks.length) {
      this.postMessage(PostMessages.UNLOCKED, unlockedLocks)
    } else {
      this.postMessage(PostMessages.LOCKED, undefined)
    }
    switch (type) {
      case 'locks':
        this.postMessage(PostMessages.UPDATE_LOCKS, this.data.locks)
        break
      case 'account':
        this.postMessage(PostMessages.UPDATE_ACCOUNT, this.data.account)
        break
      case 'balance':
        this.postMessage(PostMessages.UPDATE_ACCOUNT_BALANCE, this.data.balance)
        break
      case 'network':
        this.postMessage(PostMessages.UPDATE_NETWORK, this.data.network)
        break
      default:
        this.emitError(new Error(`Unknown update requested: ${type}`))
    }
  }

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

  purchaseKey(details: PurchaseKeyRequest) {
    if (!this.data || !this.handler) return
    if (!this.data.locks[details.lock]) {
      this.emitError(
        new Error(`Cannot purchase key on unknown lock: "${details.lock}"`)
      )
      return
    }
    const lock = this.data.locks[details.lock]
    this.handler.purchaseKey({
      lockAddress: details.lock,
      amountToSend: lock.keyPrice,
      erc20Address: lock.currencyContractAddress,
    })
  }

  emitChanges(data: BlockchainData) {
    this.data = data
    this.postMessage(PostMessages.UPDATE_ACCOUNT, this.data.account)
    this.postMessage(PostMessages.UPDATE_ACCOUNT_BALANCE, this.data.balance)
    this.postMessage(PostMessages.UPDATE_NETWORK, this.data.network)
    this.postMessage(PostMessages.UPDATE_LOCKS, this.data.locks)
    const unlockedLocks = this.getUnlockedLockAddresses()
    if (unlockedLocks.length) {
      this.postMessage(PostMessages.UNLOCKED, unlockedLocks)
    } else {
      this.postMessage(PostMessages.LOCKED, undefined)
    }
  }

  emitError(error: Error) {
    if (process.env.UNLOCK_ENV === 'dev') {
      // eslint-disable-next-line
      console.error(error)
    }
    this.postMessage(PostMessages.ERROR, error.message)
  }
}
