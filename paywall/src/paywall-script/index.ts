import Postmate from 'postmate'
import './iframe.css'
import {
  setupUnlockProtocolVariable,
  dispatchEvent,
  unlockEvents,
  injectProviderInfo,
} from './utils'
import { store, retrieve } from '../utils/localStorage'
import { willUnlock } from '../utils/optimisticUnlocking'
import { isUnlocked } from '../utils/isUnlocked'
import {
  Enabler,
  getProvider,
  Web3Window,
} from '../utils/enableInjectedProvider'

declare let __ENVIRONMENT_VARIABLES__: {
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

  constructor(paywallConfig: any) {
    this.provider = getProvider(window as Web3Window)

    const loadCheckoutModal = () => {
      if (this.iframe) {
        this.showIframe()
      } else {
        this.shakeHands()
      }
    }

    const resetConfig = (config: any) => {
      this.paywallConfig = injectProviderInfo(config, this.provider)
      this.checkKeysAndLock()
      if (this.setConfig) {
        this.setConfig(this.paywallConfig)
      } else {
        this.childCallBuffer.push(['setConfig', this.paywallConfig])
      }
    }

    const getUserAccountAddress = () => {
      return this.userAccountAddress
    }

    const getState = () => {
      return this.lockStatus
    }

    resetConfig(paywallConfig)

    setupUnlockProtocolVariable({
      loadCheckoutModal,
      resetConfig,
      getUserAccountAddress,
      getState,
    })

    // Always do this last!
    this.loadCache()
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
    const { readOnlyProvider, locksmithUri } = __ENVIRONMENT_VARIABLES__
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
    const { unlockAppUrl } = __ENVIRONMENT_VARIABLES__
    const child = await new Postmate({
      url: `${unlockAppUrl}/checkout`,
      classListArray: [checkoutIframeClassName, 'show'],
    })

    this.iframe = document.getElementsByClassName(checkoutIframeClassName)[0]

    child.on(CheckoutEvents.closeModal, this.hideIframe)
    child.on(CheckoutEvents.userInfo, this.handleUserInfoEvent)

    // transactionInfo event also carries transaction hash.
    child.on(CheckoutEvents.transactionInfo, this.handleTransactionInfoEvent)

    // flush the buffer of child calls from before the iframe was ready
    this.childCallBuffer.forEach(bufferedCall => child.call(...bufferedCall))

    this.setConfig = (config: any) => {
      child.call('setConfig', config)
    }
  }

  handleTransactionInfoEvent = async ({ hash, lock }: TransactionInfo) => {
    const { readOnlyProvider } = __ENVIRONMENT_VARIABLES__
    dispatchEvent(unlockEvents.transactionSent, { hash, lock })
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

  handleUserInfoEvent = async (info: UserInfo) => {
    this.userAccountAddress = info.address
    dispatchEvent(unlockEvents.authenticated, info)
    this.cacheUserInfo(info)
    this.checkKeysAndLock()
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

const rawConfig = (window as any).unlockProtocolConfig
if (!rawConfig) {
  console.error('Missing window.unlockProtocolConfig.')
} else {
  new Paywall(rawConfig)
}
