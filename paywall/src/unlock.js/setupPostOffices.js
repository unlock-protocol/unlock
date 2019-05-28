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
  POST_MESSAGE_ERROR,
  POST_MESSAGE_UPDATE_WALLET,
} from '../paywall-builder/constants'
import dispatchEvent from './dispatchEvent'
import web3Proxy from '../paywall-builder/web3Proxy'

/**
 * set up the main window post office, relaying messages between the iframes
 *
 * @param {window} window the global context (window, global, self)
 * @param {iframe} dataIframe the data iframe element (created by document.createElement)
 * @param {iframe} CheckoutUIIframe the Checkout UI iframe element
 *                                  (created by document.createElement)
 */
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

  // send the configuration to the iframe that requested it
  setHandler(POST_MESSAGE_READY, (_, respond) => {
    if (window.unlockProtocolConfig) {
      respond(POST_MESSAGE_CONFIG, window.unlockProtocolConfig)
    }
  })

  // set up the main window side of Web3ProxyProvider
  web3Proxy(window, dataIframe, process.env.PAYWALL_URL)

  // relay the unlocked event both to the main window
  // and to the checkout UI
  setHandler(POST_MESSAGE_UNLOCKED, locks => {
    CheckoutUIPostOffice(POST_MESSAGE_UNLOCKED, locks)
    dispatchEvent(window, 'unlocked')
  })

  // relay the locked event both to the main window
  // and to the checkout UI
  setHandler(POST_MESSAGE_LOCKED, () => {
    CheckoutUIPostOffice(POST_MESSAGE_LOCKED)
    dispatchEvent(window, 'locked')
  })

  // relay error messages to the checkout UI
  setHandler(POST_MESSAGE_ERROR, error => {
    CheckoutUIPostOffice(POST_MESSAGE_ERROR, error)
  })

  // relay the fact that action is needed to confirm
  // a key purchase transaction in the user's wallet
  // to the checkout UI in order to display a modal
  setHandler(POST_MESSAGE_UPDATE_WALLET, update => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_WALLET, update)
  })

  // relay a request to purchase a key to the data iframe
  // as the user has clicked on a key in the checkout UI
  setHandler(POST_MESSAGE_PURCHASE_KEY, details => {
    dataPostOffice(POST_MESSAGE_PURCHASE_KEY, details)
  })

  // relay the most current account address to the checkout UI
  setHandler(POST_MESSAGE_UPDATE_ACCOUNT, account => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_ACCOUNT, account)
  })

  // relay the most current account balance to the checkout UI
  setHandler(POST_MESSAGE_UPDATE_ACCOUNT_BALANCE, balance => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_ACCOUNT_BALANCE, balance)
  })

  // relay the most current lock objects to the checkout UI
  setHandler(POST_MESSAGE_UPDATE_LOCKS, locks => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_LOCKS, locks)
  })

  // relay the user's wallet's current network, in order to
  // display errors if it is on the wrong network
  setHandler(POST_MESSAGE_UPDATE_NETWORK, network => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_NETWORK, network)
  })
}
