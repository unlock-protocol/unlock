import Postmate from 'postmate'
import './iframe.css'
import { dispatchEvent, unlockEvents, injectProviderInfo } from './utils'
import { store, retrieve } from '../utils/localStorage'
import { willUnlock } from '../utils/optimisticUnlocking'
import { isUnlocked } from '../utils/isUnlocked'
import {
  Enabler,
  getProvider,
  Web3Window,
  enableInjectedProvider,
} from '../utils/enableInjectedProvider'

interface ModuleConfig {
  unlockAppUrl: string
  readOnlyProvider: string
  locksmithUri: string
}
export const checkoutIframeClassName = 'unlock-protocol-checkout'

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
}

export enum CheckoutEvents {
  userInfo = 'checkout.userInfo',
  closeModal = 'checkout.closeModal',
  transactionInfo = 'checkout.transactionInfo',
  methodCall = 'checkout.methodCall',
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

export class Paywall {
  childCallBuffer: [string, any?][] = []

  paywallConfig: any

  userAccountAddress?: string

  iframe?: Element

  setConfig?: (config: any) => void

  lockStatus?: string

  provider?: Enabler

  child?: Postmate.ParentAPI

  moduleConfig: ModuleConfig

  constructor(paywallConfig: any, moduleConfig: ModuleConfig, provider?: any) {
    this.moduleConfig = moduleConfig
    // Use provider in parameter, fall back to injected provider in window (if any)
    this.provider = provider || getProvider(window as Web3Window)

    this.resetConfig(paywallConfig)

    // Always do this last!
    this.loadCache()
  }

  loadCheckoutModal = () => {
    if (this.iframe) {
      this.showIframe()
    } else {
      this.shakeHands()
    }
  }

  getUserAccountAddress = () => {
    return this.userAccountAddress
  }

  resetConfig = (config: any) => {
    this.paywallConfig = injectProviderInfo(config, this.provider)
    this.checkKeysAndLock()
    if (this.setConfig) {
      this.setConfig(this.paywallConfig)
    } else {
      this.childCallBuffer.push(['setConfig', this.paywallConfig])
    }
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
  checkKeysAndLock = async () => {
    const { readOnlyProvider, locksmithUri } = this.moduleConfig
    if (!this.userAccountAddress) {
      return
    }
    this.lockStatus = undefined
    if (
      await isUnlocked(this.userAccountAddress, this.paywallConfig, {
        readOnlyProvider,
        locksmithUri,
      })
    ) {
      return this.unlockPage()
    }
    return this.lockPage()
  }

  shakeHands = async () => {
    const { unlockAppUrl } = this.moduleConfig
    const child = await new Postmate({
      url: `${unlockAppUrl}/checkout`,
      classListArray: [checkoutIframeClassName, 'show'],
    })

    this.child = child

    this.iframe = document.getElementsByClassName(checkoutIframeClassName)[0]

    child.on(CheckoutEvents.closeModal, this.hideIframe)
    child.on(CheckoutEvents.userInfo, this.handleUserInfoEvent)
    child.on(CheckoutEvents.methodCall, this.handleMethodCallEvent)

    // transactionInfo event also carries transaction hash.
    child.on(CheckoutEvents.transactionInfo, this.handleTransactionInfoEvent)

    // flush the buffer of child calls from before the iframe was ready
    this.childCallBuffer.forEach(bufferedCall => child.call(...bufferedCall))

    this.setConfig = (config: any) => {
      child.call('setConfig', config)
    }
  }

  handleTransactionInfoEvent = async ({ hash, lock }: TransactionInfo) => {
    const { readOnlyProvider } = this.moduleConfig
    dispatchEvent(unlockEvents.transactionSent, { hash, lock })
    if (!this.paywallConfig.pessimistic) {
      const optimistic = await willUnlock(
        readOnlyProvider,
        this.userAccountAddress!,
        lock,
        hash,
        true // Optimistic if missing
      )
      if (optimistic) {
        this.unlockPage()
      }
    }
  }

  handleUserInfoEvent = async (info: UserInfo) => {
    this.userAccountAddress = info.address
    dispatchEvent(unlockEvents.authenticated, info)
    this.cacheUserInfo(info)
    this.checkKeysAndLock()
  }

  handleMethodCallEvent = async ({ method, params, id }: MethodCall) => {
    await enableInjectedProvider(this.provider)
    ;(this.provider! as any).sendAsync(
      { method, params, id },
      (error: any, response: any) => {
        this.child!.call('resolveMethodCall', { id, error, response })
      }
    )
  }

  showIframe = () => {
    this.iframe!.classList.add('show')
  }

  hideIframe = () => {
    this.iframe!.classList.remove('show')
  }

  lockPage = () => {
    this.lockStatus = 'locked'
    dispatchEvent(unlockEvents.status, {
      state: this.lockStatus,
    })
  }

  unlockPage = () => {
    this.lockStatus = 'unlocked'
    dispatchEvent(unlockEvents.status, {
      state: this.lockStatus,
    })
  }
}
