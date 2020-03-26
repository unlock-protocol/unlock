import Postmate from 'postmate'
import './iframe.css'
import { setupUnlockProtocolVariable, dispatchEvent } from './utils'
import { store, retrieve } from '../utils/localStorage'
import { willUnlock } from '../utils/optimisticUnlocking'
import { isUnlocked } from '../utils/isUnlocked'

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

  constructor(paywallConfig: any) {
    const loadCheckoutModal = () => {
      if (this.iframe) {
        this.showIframe()
      } else {
        this.shakeHands()
      }
    }

    const resetConfig = (config: any) => {
      this.paywallConfig = config
      this.checkKeysAndLock()
      if (this.setConfig) {
        this.setConfig(config)
      } else {
        this.childCallBuffer.push(['setConfig', config])
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
    if (!this.userAccountAddress) {
      return
    }
    this.lockStatus = undefined
    if (await isUnlocked(this.userAccountAddress, this.paywallConfig)) {
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
    dispatchEvent('locked')
  }

  unlockPage = () => {
    this.lockStatus = 'unlocked'
    dispatchEvent('unlocked')
  }
}

const rawConfig = (window as any).unlockProtocolConfig
new Paywall(rawConfig)
