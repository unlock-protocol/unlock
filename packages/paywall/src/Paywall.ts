import Postmate from 'postmate'
import { PaywallConfig, NetworkConfigs } from '@unlock-protocol/types'
import './iframe.css'
import { dispatchEvent, unlockEvents, injectProviderInfo } from './utils'
import { store, retrieve } from './utils/localStorage'
import { isUnlocked } from './utils/isUnlocked'
import {
  getInjectedProvider,
  enableProvider,
  PaywallProvider,
} from './utils/provider'
import { unlockAppUrl } from './urls'

export const checkoutIframeClassName = 'unlock-protocol-checkout'

// TODO move to newer format for provider
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#request

/**
 * These type definitions come from `useCheckoutCommunication` in
 * `unlock-app`. We'll have to keep them in sync manually because we
 * don't have access to `unlock-app` files in the `paywall` docker
 * image.
 */
export interface UserInfo {
  address: string
}

export interface TransactionInfo {
  hash: string
  lock: string
  tokenIds?: string[]
  metadata?: any
}

export enum CheckoutEvents {
  userInfo = 'checkout.userInfo',
  closeModal = 'checkout.closeModal',
  transactionInfo = 'checkout.transactionInfo',
  metadata = 'checkout.metadata',
  methodCall = 'checkout.methodCall',
  onEvent = 'checkout.onEvent',
  enable = 'checkout.enable',
  resolveMethodCall = 'checkout.resolveMethodCall',
  resolveOnEventCall = 'checkout.resolveOnEventCall',
}

export interface MethodCall {
  method: string
  params: any
  id: string | number
}

export interface MethodCallResult {
  id: number
  response?: any
  error?: any
}
/* end type definitions */

/**
 * Using a single child object
 */
let postmateChild: any

export class Paywall {
  childCallBuffer: [string, any?][] = []

  networkConfigs: NetworkConfigs

  paywallConfig!: PaywallConfig

  userAccountAddress?: string

  iframe?: Element

  lockStatus?: string

  provider?: any

  child?: Postmate.ParentAPI

  constructor(networkConfigs: NetworkConfigs) {
    this.networkConfigs = networkConfigs
  }

  /**
   * Connects to an existing provider. Call this, or authenticate in which can we will use the
   * provider passed from the child iframe.
   * @param provider?
   */
  connect = async (provider?: any) => {
    this.provider = provider || getInjectedProvider()
  }

  /**
   * Uses the provider from Unlock. Returns a EIP1193 compliant provider
   * @param unlockUrl
   * @returns
   */
  getProvider = (unlockUrl?: string, config?: any) => {
    this.provider = new PaywallProvider(this, unlockUrl, config)
    return this.provider
  }

  /**
   * Loads the checkout modal!
   * @param config
   * @param unlockUrl
   */
  loadCheckoutModal = async (config?: PaywallConfig, unlockUrl?: string) => {
    if (this.iframe) {
      this.showIframe()
    } else {
      await this.shakeHands(unlockUrl || unlockAppUrl)
    }
    this.sendOrBuffer(
      'setConfig',
      injectProviderInfo(config || this.paywallConfig, this.provider)
    )
  }

  setPaywallConfig = (config: PaywallConfig) => {
    if (this.provider && !this.provider.isPaywallProvider) {
      config.autoconnect = true // force autoconnect, when the provider is external
    }
    // Use provider in parameter, fall back to injected provider in window (if any)
    this.paywallConfig = injectProviderInfo(config, this.provider)
    // Always do this last!
    this.loadCache()

    this.paywallConfig = injectProviderInfo(config, this.provider)
    this.checkKeysAndLock()
    this.sendOrBuffer(
      'setConfig',
      injectProviderInfo(config || this.paywallConfig, this.provider)
    )
  }

  shakeHands = async (unlockAppUrl: string) => {
    console.debug(`Connecting to ${unlockAppUrl}`)
    if (!postmateChild) {
      postmateChild = await new Postmate({
        url: `${unlockAppUrl}/checkout`,
        classListArray: [checkoutIframeClassName],
      })
    }

    this.child = postmateChild
    this.iframe = document.getElementsByClassName(checkoutIframeClassName)[0]
    this.showIframe()
    this.child!.on(CheckoutEvents.closeModal, this.hideIframe)
    this.child!.on(CheckoutEvents.userInfo, this.handleUserInfoEvent)
    this.child!.on(CheckoutEvents.methodCall, this.handleMethodCallEvent)
    this.child!.on(CheckoutEvents.onEvent, this.handleOnEventEvent)
    this.child!.on(CheckoutEvents.enable, this.handleEnable)
    this.child!.on(CheckoutEvents.metadata, this.handleMetadataEvent)

    // transactionInfo event also carries transaction hash.
    this.child!.on(
      CheckoutEvents.transactionInfo,
      this.handleTransactionInfoEvent
    )

    // flush the buffer of child calls from before the iframe was ready
    this.childCallBuffer.forEach((bufferedCall) =>
      this.child!.call(...bufferedCall)
    )
  }

  sendOrBuffer = (method: string, args: any) => {
    if (this.child) {
      this.child.call(method, args)
    } else {
      this.childCallBuffer.push([method, args])
    }
  }

  handleTransactionInfoEvent = async ({
    hash,
    lock,
    ...rest
  }: TransactionInfo) => {
    dispatchEvent(unlockEvents.transactionSent, { hash, lock, ...rest })
    if (!this.paywallConfig.pessimistic && hash && lock) {
      this.unlockPage([lock])
    }
  }

  async handleMetadataEvent(metadata: any) {
    dispatchEvent(unlockEvents.metadata, metadata)
  }

  handleUserInfoEvent = async (info: UserInfo) => {
    this.userAccountAddress = info.address
    dispatchEvent(unlockEvents.authenticated, info)
    this.cacheUserInfo(info)
    this.checkKeysAndLock()
  }

  handleMethodCallEvent = async ({ method, params, id }: MethodCall) => {
    const provider = this.provider as any
    if (provider.request) {
      return provider
        .request({ method, params, id })
        .then((response) => {
          this.child!.call('resolveMethodCall', { id, error: null, response })
        })
        .catch((error) => {
          this.child!.call('resolveMethodCall', { id, error, response: null })
        })
    } else if (provider.sendAsync) {
      provider.sendAsync(
        { method, params, id },
        (error: any, response: any) => {
          this.child!.call('resolveMethodCall', { id, error, response })
        }
      )
    } else {
      console.error(
        'unknown method to call provider! Please make sure you use and EIP1193 provider!'
      )
    }
  }

  handleOnEventEvent = async (eventName: string) => {
    const provider = this.provider as any
    provider.on(eventName, () => {
      this.child!.call('resolveOnEvent', eventName)
    })
  }

  handleEnable = async () => {
    const result = await enableProvider(this.provider)
    this.child!.call('resolveOnEnable', result)
  }

  showIframe = () => {
    this.iframe!.classList.add('show')
  }

  hideIframe = () => {
    dispatchEvent(unlockEvents.closeModal, {})
    this.iframe!.classList.remove('show')
  }

  /********************
   * Legacy/deprecated methods
   ********************/

  getUserAccountAddress = () => {
    return this.userAccountAddress
  }

  getState = () => {
    return this.lockStatus
  }

  cacheUserInfo = async (info: UserInfo) => {
    store('userInfo', info)
  }

  loadCache = async () => {
    const info = retrieve('userInfo')
    if (!info) {
      return this.lockPage()
    }
    this.userAccountAddress = info.address
    this.checkKeysAndLock()
  }

  async checkKeysAndLock() {
    if (!this.userAccountAddress) {
      return
    }

    this.lockStatus = undefined

    const unlockedLocks = await isUnlocked(
      this.userAccountAddress,
      this.paywallConfig,
      this.networkConfigs
    )

    if (unlockedLocks.length) {
      return this.unlockPage(unlockedLocks)
    }
    return this.lockPage()
  }

  lockPage = () => {
    this.lockStatus = 'locked'
    dispatchEvent(unlockEvents.status, {
      state: this.lockStatus,
    })
  }

  unlockPage = (locks: string[] = []) => {
    this.lockStatus = 'unlocked'
    dispatchEvent(unlockEvents.status, {
      locks,
      state: this.lockStatus,
    })
  }
}
