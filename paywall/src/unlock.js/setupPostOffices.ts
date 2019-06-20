import dispatchEvent from './dispatchEvent'
import web3Proxy from './web3Proxy'
import { showIframe } from './iframeManager'
import { IframeType, UnlockWindow } from '../windowTypes'
import setupUnlockProtocolVariable from './setupUnlockProtocolVariable'
import { PostMessages, MessageTypes } from '../messageTypes'
import setupIframeMailbox, {
  MessageHandlerTemplates,
} from './setupIframeMailbox'

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
  CheckoutUIIframe: IframeType,
  AccountUIIframe: IframeType
) {
  const mapHandlers = setupIframeMailbox(
    window,
    CheckoutUIIframe,
    dataIframe,
    AccountUIIframe
  )

  const hideCheckoutModal = setupUnlockProtocolVariable(
    window,
    CheckoutUIIframe
  )

  const dataHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.READY]: send => {
      return () => {
        if (window.unlockProtocolConfig) {
          // send the configuration to the data iframe
          send('data', PostMessages.CONFIG, window.unlockProtocolConfig)
        }
      }
    },
    [PostMessages.UNLOCKED]: send => {
      return locks => {
        // relay the unlocked event both to the main window
        // and to the checkout UI
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
        send('checkout', PostMessages.UNLOCKED, locks)
      }
    },
    [PostMessages.LOCKED]: send => {
      return () => {
        // relay the locked event both to the main window
        // and to the checkout UI
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
        send('checkout', PostMessages.LOCKED, undefined)
      }
    },
    [PostMessages.ERROR]: send => {
      return error => {
        // relay error messages to the checkout UI
        send('checkout', PostMessages.ERROR, error)
      }
    },
    [PostMessages.UPDATE_WALLET]: send => {
      return update => {
        // relay the fact that action is needed to confirm
        // a key purchase transaction in the user's wallet
        // to the checkout UI in order to display a modal
        send('checkout', PostMessages.UPDATE_WALLET, update)
      }
    },
    [PostMessages.UPDATE_ACCOUNT]: send => {
      return account => {
        // relay the most current account address to the checkout UI
        send('checkout', PostMessages.UPDATE_ACCOUNT, account)
      }
    },
    [PostMessages.UPDATE_NETWORK]: send => {
      return network => {
        // relay the user's wallet's current network, in order to
        // display errors if it is on the wrong network
        send('checkout', PostMessages.UPDATE_NETWORK, network)
      }
    },
    [PostMessages.UPDATE_ACCOUNT_BALANCE]: send => {
      return balance => {
        // relay the most current account balance to the checkout UI
        send('checkout', PostMessages.UPDATE_ACCOUNT_BALANCE, balance)
      }
    },
    [PostMessages.UPDATE_LOCKS]: send => {
      return locks => {
        // relay the most current lock objects to the checkout UI
        send('checkout', PostMessages.UPDATE_LOCKS, locks)
      }
    },
  }

  const checkoutHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.READY]: send => {
      return () => {
        // send the configuration to the checkout iframe
        if (window.unlockProtocolConfig) {
          send('checkout', PostMessages.CONFIG, window.unlockProtocolConfig)
          // trigger a send of the current state
          send('data', PostMessages.SEND_UPDATES, 'network')
          send('data', PostMessages.SEND_UPDATES, 'account')
          send('data', PostMessages.SEND_UPDATES, 'balance')
          send('data', PostMessages.SEND_UPDATES, 'locks')
          if (window.unlockProtocolConfig.type === 'paywall') {
            // always show the checkout modal on start for the paywall app
            showIframe(window, CheckoutUIIframe)
          }
        }
      }
    },
    [PostMessages.DISMISS_CHECKOUT]: () => {
      return () => {
        // if the user chooses to close the checkout modal, we hide the iframe
        hideCheckoutModal()
      }
    },
    [PostMessages.PURCHASE_KEY]: send => {
      return details => {
        // relay a request to purchase a key to the data iframe
        // as the user has clicked on a key in the checkout UI
        send('data', PostMessages.PURCHASE_KEY, details)
      }
    },
  }

  mapHandlers('data', dataHandlers)
  mapHandlers('checkout', checkoutHandlers)

  // set up the main window side of Web3ProxyProvider
  web3Proxy(window, dataIframe, process.env.PAYWALL_URL)
}
