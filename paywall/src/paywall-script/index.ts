import Postmate from 'postmate'
import './iframe.css'
import { setupUnlockProtocolVariable, dispatchEvent } from './utils'

declare let __ENVIRONMENT_VARIABLES__: { unlockAppUrl: string }
const checkoutIframeClassName = 'unlock-protocol-checkout'

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

const { unlockAppUrl } = __ENVIRONMENT_VARIABLES__
const rawConfig = (window as any).unlockProtocolConfig
const encodedConfig = encodeURIComponent(JSON.stringify(rawConfig))

let iframe: Element | undefined

let loadCheckoutModal = () => {
  if (iframe) {
    iframe.classList.add('show')
  } else {
    shakeHands()
  }
}

dispatchEvent('locked')

async function shakeHands() {
  const handshake = new Postmate({
    url: `${unlockAppUrl}/checkout?paywallConfig=${encodedConfig}`,
    classListArray: [checkoutIframeClassName, 'show'],
  })

  handshake.then(child => {
    iframe = document.getElementsByClassName(checkoutIframeClassName)[0]

    child.on(CheckoutEvents.closeModal, () => {
      iframe!.classList.remove('show')
    })

    child.on(CheckoutEvents.userInfo, (info: UserInfo) => {
      console.log(`got user address: ${info.address}`)
    })

    child.on(CheckoutEvents.transactionInfo, (info: TransactionInfo) => {
      console.log(`got transaction hash: ${info.hash}`)
    })
  })
}

setupUnlockProtocolVariable({ loadCheckoutModal })
