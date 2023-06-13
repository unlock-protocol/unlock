import Postmate from 'postmate'
import { PaywallConfig, NetworkConfigs } from '@unlock-protocol/types'
import './iframe.css'
import { dispatchEvent, unlockEvents, injectProviderInfo } from './utils'
import { store, retrieve } from './utils/localStorage'
import { isUnlocked } from './utils/isUnlocked'
import {
  Enabler,
  getProvider,
  Web3Window,
  enableInjectedProvider,
} from './utils/enableInjectedProvider'
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
  tokenId?: string
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
}

export interface MethodCall {
  method: string
  params: any
  id: number
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

  provider?: Enabler

  child?: Postmate.ParentAPI

  constructor(
    paywallConfig: PaywallConfig,
    networkConfigs: NetworkConfigs,
    provider?: any
  ) {
    this.networkConfigs = networkConfigs
    if (provider) {
      paywallConfig.autoconnect = true // force autoconnect
    }
    // Use provider in parameter, fall back to injected provider in window (if any)
    this.provider = provider || getProvider(window as Web3Window)
    this.paywallConfig = injectProviderInfo(paywallConfig, this.provider)
    // Always do this last!
    this.loadCache()
  }

  authenticate = (unlockUrl?: string) => {
    if (this.iframe) {
      this.showIframe()
    } else {
      this.shakeHands(unlockUrl || unlockAppUrl)
    }
    this.sendOrBuffer('authenticate', {})
  }

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
    return new Promise((resolve) => {
      let hash: string, lock: string
      this.child!.on(
        CheckoutEvents.transactionInfo,
        (transactionInfo: TransactionInfo) => {
          hash = transactionInfo.hash
          lock = transactionInfo.lock
          this.handleTransactionInfoEvent(transactionInfo)
        }
      )
      this.child!.on(CheckoutEvents.closeModal, () => {
        this.hideIframe()
        resolve({ hash, lock })
      })
    })
  }

  getUserAccountAddress = () => {
    return this.userAccountAddress
  }

  resetConfig = (config: PaywallConfig) => {
    this.paywallConfig = injectProviderInfo(config, this.provider)
    this.checkKeysAndLock()
    this.sendOrBuffer(
      'setConfig',
      injectProviderInfo(config || this.paywallConfig, this.provider)
    )
  }

  getState = () => {
    return this.lockStatus
  }

  // Saves the user info in the cache
  cacheUserInfo = async (info: UserInfo) => {
    store('userInfo', info)
  }

  // Loads the cache
  loadCache = async () => {
    const info = retrieve('userInfo')
    if (!info) {
      return this.lockPage()
    }
    this.userAccountAddress = info.address
    this.checkKeysAndLock()
  }

  // Will lock or unlock the page based on the current state
  async checkKeysAndLock() {
    // For each lock.

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
    const result = await enableInjectedProvider(this.provider)
    this.child!.call('resolveOnEnable', result)
  }

  showIframe = () => {
    this.iframe!.classList.add('show')
  }

  hideIframe = () => {
    dispatchEvent(unlockEvents.closeModal, {})
    this.iframe!.classList.remove('show')
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
