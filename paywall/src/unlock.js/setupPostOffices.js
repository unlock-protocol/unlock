import { setupPostOffice, setHandler } from '../utils/postOffice'
import {
  POST_MESSAGE_READY,
  POST_MESSAGE_CONFIG,
  POST_MESSAGE_LOCKED,
  POST_MESSAGE_UNLOCKED,
  POST_MESSAGE_PURCHASE_KEY,
  POST_MESSAGE_UPDATE_ACCOUNT,
  POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
  POST_MESSAGE_UPDATE_LOCKS,
  POST_MESSAGE_UPDATE_NETWORK,
} from '../paywall-builder/constants'
import dispatchEvent from './dispatchEvent'
import web3Proxy from '../paywall-builder/web3Proxy'

export default function setupPostOffices(window, dataIframe, CheckoutUIIframe) {
  const dataPostOffice = setupPostOffice(
    window,
    dataIframe.contentWindow,
    process.env.PAYWALL_URL
  )
  const CheckoutUIPostOffice = setupPostOffice(
    window,
    CheckoutUIIframe.contentWindow,
    process.env.PAYWALL_URL
  )

  setHandler(POST_MESSAGE_READY, (_, respond) => {
    if (window.unlockProtocolConfig) {
      respond(POST_MESSAGE_CONFIG, window.unlockProtocolConfig)
    }
  })

  // set up the main window side of Web3ProxyProvider
  web3Proxy(window, dataIframe, process.env.PAYWALL_URL)

  setHandler(POST_MESSAGE_UNLOCKED, locks => {
    CheckoutUIPostOffice(POST_MESSAGE_UNLOCKED, locks)
    dispatchEvent(window, 'unlocked')
  })

  setHandler(POST_MESSAGE_LOCKED, () => {
    CheckoutUIPostOffice(POST_MESSAGE_LOCKED)
    dispatchEvent(window, 'locked')
  })

  setHandler(POST_MESSAGE_PURCHASE_KEY, details => {
    dataPostOffice(POST_MESSAGE_PURCHASE_KEY, details)
  })

  setHandler(POST_MESSAGE_UPDATE_ACCOUNT, account => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_ACCOUNT, account)
  })

  setHandler(POST_MESSAGE_UPDATE_ACCOUNT_BALANCE, balance => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_ACCOUNT_BALANCE, balance)
  })

  setHandler(POST_MESSAGE_UPDATE_LOCKS, locks => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_LOCKS, locks)
  })

  setHandler(POST_MESSAGE_UPDATE_NETWORK, network => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_NETWORK, network)
  })
}
