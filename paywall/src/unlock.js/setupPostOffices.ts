import { mainWindowPostOffice } from '../utils/postOffice'
import dispatchEvent from './dispatchEvent'
import web3Proxy from './web3Proxy'
import { showIframe } from './iframeManager'
import { IframeType, UnlockWindow } from '../windowTypes'
import setupUnlockProtocolVariable from './setupUnlockProtocolVariable'
import { PostMessages } from '../messageTypes'

interface process {
  env: any
}

declare const process: process

/**
 * set up the main window post office, relaying messages between the iframes
 *
 * @param {window} window the global context (window, global, self)
 * @param {iframe} dataIframe the data iframe element (created by document.createElement)
 * @param {iframe} CheckoutUIIframe the Checkout UI iframe element
 *                                  (created by document.createElement)
 */
export default function setupPostOffices(
  window: UnlockWindow,
  dataIframe: IframeType,
  CheckoutUIIframe: IframeType
) {
  const {
    postMessage: dataPostOffice,
    addHandler: addDataMessageHandler,
  } = mainWindowPostOffice(
    window,
    dataIframe,
    process.env.PAYWALL_URL,
    'main window',
    'Data iframe'
  )
  const {
    postMessage: CheckoutUIPostOffice,
    addHandler: addCheckoutMessageHandler,
  } = mainWindowPostOffice(
    window,
    CheckoutUIIframe,
    process.env.PAYWALL_URL,
    'main window',
    'Checkout UI'
  )

  const hideCheckoutModal = setupUnlockProtocolVariable(
    window,
    CheckoutUIIframe
  )

  // send the configuration to the data iframe
  addDataMessageHandler(PostMessages.READY, (_, respond) => {
    if (window.unlockProtocolConfig) {
      respond(PostMessages.CONFIG, window.unlockProtocolConfig)
    }
  })

  // send the configuration to the checkout iframe
  addCheckoutMessageHandler(PostMessages.READY, (_, respond) => {
    if (window.unlockProtocolConfig) {
      respond(PostMessages.CONFIG, window.unlockProtocolConfig)
      // trigger a send of the current state
      dataPostOffice(PostMessages.SEND_UPDATES, 'network')
      dataPostOffice(PostMessages.SEND_UPDATES, 'account')
      dataPostOffice(PostMessages.SEND_UPDATES, 'balance')
      dataPostOffice(PostMessages.SEND_UPDATES, 'locks')
      if (window.unlockProtocolConfig.type === 'paywall') {
        // always show the checkout modal on start for the paywall app
        showIframe(window, CheckoutUIIframe)
      }
    }
  })

  // set up the main window side of Web3ProxyProvider
  web3Proxy(window, dataIframe, process.env.PAYWALL_URL)

  // relay the unlocked event both to the main window
  // and to the checkout UI
  addDataMessageHandler(PostMessages.UNLOCKED, locks => {
    dispatchEvent(window, 'unlocked')
    try {
      // this is a fast cache. The value will only be used
      // to prevent a flash of ads on startup. If a cheeky
      // user attempts to prevent display of ads by setting
      // the localStorage cache, it will only work for a
      // few milliseconds
      window.localStorage.setItem(
        '__unlockProtocol.locked',
        JSON.stringify(false)
      )
    } catch (e) {
      // ignore
    }
    CheckoutUIPostOffice(PostMessages.UNLOCKED, locks)
  })

  // if the user chooses to close the checkout modal, we hide the iframe
  addCheckoutMessageHandler(PostMessages.DISMISS_CHECKOUT, () => {
    hideCheckoutModal()
  })

  // relay the locked event both to the main window
  // and to the checkout UI
  addDataMessageHandler(PostMessages.LOCKED, () => {
    dispatchEvent(window, 'locked')
    try {
      // reset the cache to locked for the next page view
      window.localStorage.setItem(
        '__unlockProtocol.locked',
        JSON.stringify(true)
      )
    } catch (e) {
      // ignore
    }
    CheckoutUIPostOffice(PostMessages.LOCKED, undefined)
  })

  // relay error messages to the checkout UI
  addDataMessageHandler(PostMessages.ERROR, error => {
    CheckoutUIPostOffice(PostMessages.ERROR, error)
  })

  // relay the fact that action is needed to confirm
  // a key purchase transaction in the user's wallet
  // to the checkout UI in order to display a modal
  addDataMessageHandler(PostMessages.UPDATE_WALLET, update => {
    CheckoutUIPostOffice(PostMessages.UPDATE_WALLET, update)
  })

  // relay a request to purchase a key to the data iframe
  // as the user has clicked on a key in the checkout UI
  addCheckoutMessageHandler(PostMessages.PURCHASE_KEY, details => {
    dataPostOffice(PostMessages.PURCHASE_KEY, details)
  })

  // relay the most current account address to the checkout UI
  addDataMessageHandler(PostMessages.UPDATE_ACCOUNT, account => {
    CheckoutUIPostOffice(PostMessages.UPDATE_ACCOUNT, account)
  })

  // relay the most current account balance to the checkout UI
  addDataMessageHandler(PostMessages.UPDATE_ACCOUNT_BALANCE, balance => {
    CheckoutUIPostOffice(PostMessages.UPDATE_ACCOUNT_BALANCE, balance)
  })

  // relay the most current lock objects to the checkout UI
  addDataMessageHandler(PostMessages.UPDATE_LOCKS, locks => {
    CheckoutUIPostOffice(PostMessages.UPDATE_LOCKS, locks)
  })

  // relay the user's wallet's current network, in order to
  // display errors if it is on the wrong network
  addDataMessageHandler(PostMessages.UPDATE_NETWORK, network => {
    CheckoutUIPostOffice(PostMessages.UPDATE_NETWORK, network)
  })
}
