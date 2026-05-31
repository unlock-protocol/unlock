import Postmate from 'postmate'
import { NetworkConfigs } from '@unlock-protocol/types'
import { PaywallConfigType } from '@unlock-protocol/core'
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
import { notifyCheckoutHook } from './utils/hooks'

export const checkoutIframeClassName = 'unlock-protocol-checkout'

Postmate.debug = true

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
  metadata?: unknown
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
  params: unknown
  id: string | number
}

export interface OauthConfig {
  clientId: string
  responseType?: string
  state?: string
  redirectUri?: string
}

export interface MethodCallResult {
  id: number
  response?: unknown
  error?: unknown
}
/* end type definitions */

type HookEvent = 'status' | 'authenticated' | 'transactionSent' | 'metadata'
type CheckoutEventPayload = unknown

interface EthereumProviderLike {
  isPaywallProvider?: boolean
  enable?: () => Promise<unknown> | unknown
  request?: (args: MethodCall) => Promise<unknown>
  sendAsync?: (
    args: MethodCall,
    callback: (error: unknown, response: unknown) => void
  ) => void
  on?: (eventName: string, callback: () => void) => void
}

/**
 * Using a single child object
 */
let postmateChild: Postmate.ParentAPI | undefined

export class Paywall {
  childCallBuffer: [string, unknown?][] = []

  networkConfigs: NetworkConfigs

  paywallConfig!: PaywallConfigType

  userAccountAddress?: string

  iframe?: Element

  lockStatus?: string

  provider?: EthereumProviderLike

  child?: Postmate.ParentAPI

  constructor(networkConfigs: NetworkConfigs) {
    this.networkConfigs = networkConfigs
  }

  /**
   * Connects to an existing provider. Call this, or authenticate in which can we will use the
   * provider passed from the child iframe.
   * @param provider?
   */
  connect = async (provider?: EthereumProviderLike) => {
    this.provider = provider || getInjectedProvider()
  }

  /**
   * Uses the provider from Unlock. Returns a EIP1193 compliant provider
   * @param unlockUrl
   * @returns
   */
  getProvider = (
    unlockUrl = 'https://app.unlock-protocol.com',
    config: OauthConfig = {
      clientId: window.location.origin.toString(),
    }
  ) => {
    if (!this.provider) {
      this.provider = new PaywallProvider(this, unlockUrl, config)
    }
    return this.provider
  }

  /**
   * Loads the checkout modal. Returns a Promise that resolves when the modal is closed.
   * @param config
   * @param unlockUrl
   */
  loadCheckoutModal = async (
    config?: PaywallConfigType,
    unlockUrl?: string
  ) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const returnValue: {
        userAddress?: string
        transactionInfo?: TransactionInfo
      } = {}
      const eventHandler = (name: string, data: CheckoutEventPayload) => {
        if (name == 'checkout.userInfo') {
          returnValue.userAddress = (data as UserInfo).address
        }
        if (name == 'checkout.transactionInfo') {
          returnValue.transactionInfo = data as TransactionInfo
        }
        if (name === 'checkout.closeModal') {
          return resolve(returnValue)
        }
      }
      if (this.iframe) {
        this.showIframe()
      } else {
        await this.shakeHands(unlockUrl || unlockAppUrl, eventHandler)
      }
      this.setPaywallConfig(config || this.paywallConfig)
    })
  }

  // Explicitly sets a checkout config on the paywall object.
  setPaywallConfig = (config: PaywallConfigType) => {
    if (this.provider && !this.provider.isPaywallProvider) {
      config.autoconnect = true // force autoconnect, when the provider is external
    }
    // Use provider in parameter, fall back to injected provider in window (if any)
    this.paywallConfig = injectProviderInfo(
      config,
      this.provider as Parameters<typeof injectProviderInfo>[1]
    )
    // Always do this last!
    this.loadCache()

    this.paywallConfig = injectProviderInfo(
      config,
      this.provider as Parameters<typeof injectProviderInfo>[1]
    )
    this.checkKeysAndLock()
    this.sendOrBuffer(
      'setConfig',
      injectProviderInfo(
        config || this.paywallConfig,
        this.provider as Parameters<typeof injectProviderInfo>[1]
      )
    )
  }

  /********************
   * Internal methods
   ********************/

  shakeHands = async (
    unlockAppUrl: string,
    eventHandler?: (name: string, data?: CheckoutEventPayload) => void
  ) => {
    if (!postmateChild) {
      postmateChild = await new Postmate({
        url: `${unlockAppUrl}/checkout`,
        classListArray: [checkoutIframeClassName],
      })
    }

    this.child = postmateChild
    this.iframe = document.getElementsByClassName(checkoutIframeClassName)[0]
    this.showIframe()
    this.child!.on(CheckoutEvents.closeModal, () => {
      this.hideIframe()
      if (typeof eventHandler === 'function')
        eventHandler(CheckoutEvents.closeModal)
    })
    this.child!.on(CheckoutEvents.userInfo, (data: CheckoutEventPayload) => {
      this.handleUserInfoEvent(data as UserInfo)
      if (typeof eventHandler === 'function')
        eventHandler(CheckoutEvents.userInfo, data)
    })
    this.child!.on(CheckoutEvents.methodCall, (data: CheckoutEventPayload) => {
      this.handleMethodCallEvent(data as MethodCall)
      if (typeof eventHandler === 'function')
        eventHandler(CheckoutEvents.methodCall, data)
    })
    this.child!.on(CheckoutEvents.onEvent, (data: CheckoutEventPayload) => {
      this.handleOnEventEvent(data as string)
      if (typeof eventHandler === 'function')
        eventHandler(CheckoutEvents.onEvent, data)
    })
    this.child!.on(CheckoutEvents.enable, (data: CheckoutEventPayload) => {
      this.handleEnable()
      if (typeof eventHandler === 'function')
        eventHandler(CheckoutEvents.enable, data)
    })
    this.child!.on(CheckoutEvents.metadata, (data: CheckoutEventPayload) => {
      this.handleMetadataEvent(data)
      if (typeof eventHandler === 'function')
        eventHandler(CheckoutEvents.metadata, data)
    })
    this.child!.on(
      CheckoutEvents.transactionInfo,
      (data: CheckoutEventPayload) => {
        this.handleTransactionInfoEvent(data as TransactionInfo)
        if (typeof eventHandler === 'function')
          eventHandler(CheckoutEvents.transactionInfo, data)
      }
    )

    // flush the buffer of child calls from before the iframe was ready
    this.childCallBuffer.forEach((bufferedCall) =>
      this.child!.call(...bufferedCall)
    )
  }

  sendOrBuffer = (method: string, args: unknown) => {
    if (this.child) {
      this.child.call(method, args)
    } else {
      this.childCallBuffer.push([method, args])
    }
  }

  notifyHook = (event: HookEvent, payload: unknown) => {
    const hookUrl = this.paywallConfig?.hooks?.[event]
    if (hookUrl) {
      void notifyCheckoutHook(hookUrl, payload)
    }
  }

  handleTransactionInfoEvent = async ({
    hash,
    lock,
    ...rest
  }: TransactionInfo) => {
    const payload = { hash, lock, ...rest }
    dispatchEvent(unlockEvents.transactionSent, payload)
    this.notifyHook('transactionSent', payload)
    if (!this.paywallConfig?.pessimistic && hash && lock) {
      this.unlockPage([lock])
    }
  }

  async handleMetadataEvent(metadata: unknown) {
    dispatchEvent(unlockEvents.metadata, metadata)
    this.notifyHook('metadata', metadata)
  }

  handleUserInfoEvent = async (info: UserInfo) => {
    this.userAccountAddress = info.address
    dispatchEvent(unlockEvents.authenticated, info)
    this.notifyHook('authenticated', info)
    this.cacheUserInfo(info)
    this.checkKeysAndLock()
  }

  handleMethodCallEvent = async ({ method, params, id }: MethodCall) => {
    const provider = this.provider
    if (!provider) {
      console.error(
        'unknown method to call provider! Please make sure you use and EIP1193 provider!',
        { provider }
      )
      return
    }

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
        (error: unknown, response: unknown) => {
          this.child!.call('resolveMethodCall', { id, error, response })
        }
      )
    } else {
      console.error(
        'unknown method to call provider! Please make sure you use and EIP1193 provider!',
        { provider }
      )
    }
  }

  handleOnEventEvent = async (eventName: string) => {
    const provider = this.provider
    if (!provider?.on) {
      console.error(
        'unknown method to call provider! Please make sure you use and EIP1193 provider!',
        { provider }
      )
      return
    }
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
    const payload = {
      state: this.lockStatus,
    }
    dispatchEvent(unlockEvents.status, payload)
    this.notifyHook('status', payload)
  }

  unlockPage = (locks: string[] = []) => {
    this.lockStatus = 'unlocked'
    const payload = {
      locks,
      state: this.lockStatus,
    }
    dispatchEvent(unlockEvents.status, payload)
    this.notifyHook('status', payload)
  }
}
