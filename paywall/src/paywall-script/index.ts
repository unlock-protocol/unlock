import Postmate from 'postmate'
import './iframe.css'
import { setupUnlockProtocolVariable, dispatchEvent } from './utils'
import { keyExpirationTimestampFor } from '../utils/keyExpirationTimestampFor'
import { store, retrieve } from '../utils/localStorage'

declare let __ENVIRONMENT_VARIABLES__: {
  unlockAppUrl: string
  readOnlyProvider: string
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
      if (this.setConfig) {
        this.setConfig(config)
      } else {
        this.childCallBuffer.push(['setConfig', config])
      }
    }

    resetConfig(paywallConfig)

    setupUnlockProtocolVariable({ loadCheckoutModal, resetConfig })

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

  checkKeysAndLock = async () => {
    const { readOnlyProvider } = __ENVIRONMENT_VARIABLES__

    const lockAddresses = Object.keys(this.paywallConfig.locks)
    const timeStamps = await Promise.all(
      lockAddresses.map(lockAddress => {
        return keyExpirationTimestampFor(
          readOnlyProvider,
          lockAddress,
          this.userAccountAddress!
        )
      })
    )

    if (timeStamps.some(val => val > new Date().getTime() / 1000)) {
      this.unlockPage()
    } else {
      this.lockPage()
    }
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
    child.on(CheckoutEvents.transactionInfo, this.unlockPage)

    // flush the buffer of child calls from before the iframe was ready
    this.childCallBuffer.forEach(bufferedCall => child.call(...bufferedCall))

    this.setConfig = (config: any) => {
      child.call('setConfig', config)
      this.checkKeysAndLock()
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
    dispatchEvent('locked')
  }

  unlockPage = () => {
    dispatchEvent('unlocked')
  }
}

const rawConfig = (window as any).unlockProtocolConfig
new Paywall(rawConfig)
