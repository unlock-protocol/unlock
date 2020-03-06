import Postmate from 'postmate'

declare let __ENVIRONMENT_VARIABLES__: { unlockAppUrl: string }

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

const handshake = new Postmate({
  url: `${unlockAppUrl}/checkout?paywallConfig=${encodedConfig}`,
  classListArray: ['unlock-protocol-checkout'],
})

handshake.then(child => {
  child.on(CheckoutEvents.closeModal, () => {
    console.log('Close the modal when we receive this event.')
  })

  child.on(CheckoutEvents.userInfo, (info: UserInfo) => {
    console.log(`got user address: ${info.address}`)
  })

  child.on(CheckoutEvents.transactionInfo, (info: TransactionInfo) => {
    console.log(`got transaction hash: ${info.hash}`)
  })
})
