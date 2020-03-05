import Postmate from 'postmate'
import {
  CheckoutEvents,
  UserInfo,
  TransactionInfo,
} from '../../../unlock-app/src/hooks/useCheckoutCommunication'

declare let __ENVIRONMENT_VARIABLES__: { unlockAppUrl: string }

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
