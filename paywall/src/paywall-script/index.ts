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

let iframe: Element | undefined

let loadCheckoutModal = () => {
  if (iframe) {
    iframe.classList.add('show')
  } else {
    shakeHands()
  }
}

let setConfig: (config: any) => void | undefined

const childCallBuffer: [string, any?][] = []

// This definition is just a buffer until the child is available, it
// will be replaced when the child is initialized.
let resetConfig = (config: any) => {
  if (setConfig) {
    setConfig(config)
  } else {
    childCallBuffer.push(['setConfig', config])
  }
}

dispatchEvent('locked')

async function shakeHands() {
  const handshake = new Postmate({
    url: `${unlockAppUrl}/checkout`,
    classListArray: [checkoutIframeClassName, 'show'],
  })

  handshake.then(child => {
    iframe = document.getElementsByClassName(checkoutIframeClassName)[0]

    child.on(CheckoutEvents.closeModal, () => {
      iframe!.classList.remove('show')
    })

    // TODO: use account address to know if user already has a key
    // Lock list may have to wait for a go/no-go from the key check to
    // prevent duplicate purchase.
    child.on(CheckoutEvents.userInfo, (info: UserInfo) => {
      console.log(`got user address: ${info.address}`)
    })

    // TODO: pass transaction hash to a function that will monitor it?
    child.on(CheckoutEvents.transactionInfo, (_: TransactionInfo) => {
      dispatchEvent('unlocked')
    })

    // flush the buffer of child calls from before the iframe was ready
    childCallBuffer.forEach(bufferedCall => child.call(...bufferedCall))

    // replace the buffered version of resetConfig with the real one
    setConfig = (config: any) => {
      child.call('setConfig', config)
    }

    setConfig(rawConfig)
  })
}

setupUnlockProtocolVariable({ loadCheckoutModal, resetConfig })
