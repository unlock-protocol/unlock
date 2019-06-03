import { mainWindowPostOffice } from '../utils/postOffice'
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
  POST_MESSAGE_DISMISS_CHECKOUT,
  POST_MESSAGE_SEND_UPDATES,
} from '../paywall-builder/constants'
import dispatchEvent from './dispatchEvent'
import web3Proxy from '../paywall-builder/web3Proxy'
import { showIframe, hideIframe } from './iframeManager'

let loadCheckoutModal

/**
 * set up the main window post office, relaying messages between the iframes
 *
 * @param {window} window the global context (window, global, self)
 * @param {iframe} dataIframe the data iframe element (created by document.createElement)
 * @param {iframe} CheckoutUIIframe the Checkout UI iframe element
 *                                  (created by document.createElement)
 */
export default function setupPostOffices(window, dataIframe, CheckoutUIIframe) {
  const {
    postMessage: dataPostOffice,
    addHandler: addDataMessageHandler,
  } = mainWindowPostOffice(window, dataIframe, process.env.PAYWALL_URL)
  const {
    postMessage: CheckoutUIPostOffice,
    addHandler: addCheckoutMessageHandler,
  } = mainWindowPostOffice(window, CheckoutUIIframe, process.env.PAYWALL_URL)

  if (!loadCheckoutModal) {
    loadCheckoutModal = () => {
      showIframe(window, CheckoutUIIframe)
    }
  }
  const hideCheckoutModal = () => {
    hideIframe(window, CheckoutUIIframe)
  }

  const unlockProtocol = {}

  Object.defineProperties(unlockProtocol, {
    loadCheckoutModal: {
      value: loadCheckoutModal,
      writable: false, // prevent changing loadCheckoutModal by simple `unlockProtocol.loadCheckoutModal = () => {}`
      configurable: false, // prevent re-defining the writable property
      enumerable: false, // prevent finding it exists via `for ... of`
    },
  })

  const freeze = Object.freeze || Object

  // if freeze is available, prevents adding or
  // removing the object prototype properties
  // (value, get, set, enumerable, writable, configurable)
  freeze(unlockProtocol.protoType)
  freeze(unlockProtocol)

  // set up the unlockProtocol object on the main window
  // it will be 100% read-only, unchangeable and un-deleteable
  try {
    if (!window.unlockProtocol || window.unlockProtocol !== loadCheckoutModal) {
      Object.defineProperties(window, {
        unlockProtocol: {
          writable: false, // prevent removing unlockProtocol from window via `window.unlockProtocol = {...}`
          configurable: false, // prevent re-defining the writable property
          enumerable: false, // prevent finding it exists via `for ... of`
          value: unlockProtocol,
        },
      })
    }
  } catch (e) {
    // TODO: decide whether to be more nuclear here, for example by
    // eslint-disable-next-line no-console
    console.error(
      'WARNING: unlockProtocol already defined, cannot re-define it'
    )
  }

  // send the configuration to the data iframe
  addDataMessageHandler(POST_MESSAGE_READY, (_, respond) => {
    if (window.unlockProtocolConfig) {
      respond(POST_MESSAGE_CONFIG, window.unlockProtocolConfig)
    }
  })

  // send the configuration to the checkout iframe
  addCheckoutMessageHandler(POST_MESSAGE_READY, (_, respond) => {
    if (window.unlockProtocolConfig) {
      respond(POST_MESSAGE_CONFIG, window.unlockProtocolConfig)
      // trigger a send of the current state
      dataPostOffice(POST_MESSAGE_SEND_UPDATES, 'network')
      dataPostOffice(POST_MESSAGE_SEND_UPDATES, 'account')
      dataPostOffice(POST_MESSAGE_SEND_UPDATES, 'balance')
      dataPostOffice(POST_MESSAGE_SEND_UPDATES, 'locks')
    }
  })

  // set up the main window side of Web3ProxyProvider
  web3Proxy(window, dataIframe, process.env.PAYWALL_URL)

  let savedLocks = {}
  // relay the unlocked event both to the main window
  // and to the checkout UI
  addDataMessageHandler(POST_MESSAGE_UNLOCKED, locks => {
    CheckoutUIPostOffice(POST_MESSAGE_UNLOCKED, locks)
    if (
      locks.filter(address => {
        return (
          savedLocks[address] &&
          savedLocks[address].key &&
          savedLocks[address].key.status === 'valid'
        )
      }).length
    ) {
      hideCheckoutModal()
    }
    dispatchEvent(window, 'unlocked')
  })

  // if the user chooses to close the checkout modal, we hide the iframe
  addCheckoutMessageHandler(POST_MESSAGE_DISMISS_CHECKOUT, () => {
    hideCheckoutModal()
  })

  // relay the locked event both to the main window
  // and to the checkout UI
  addDataMessageHandler(POST_MESSAGE_LOCKED, () => {
    CheckoutUIPostOffice(POST_MESSAGE_LOCKED)
    dispatchEvent(window, 'locked')
  })

  // relay error messages to the checkout UI
  addDataMessageHandler(POST_MESSAGE_ERROR, error => {
    CheckoutUIPostOffice(POST_MESSAGE_ERROR, error)
  })

  // relay the fact that action is needed to confirm
  // a key purchase transaction in the user's wallet
  // to the checkout UI in order to display a modal
  addDataMessageHandler(POST_MESSAGE_UPDATE_WALLET, update => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_WALLET, update)
  })

  // relay a request to purchase a key to the data iframe
  // as the user has clicked on a key in the checkout UI
  addCheckoutMessageHandler(POST_MESSAGE_PURCHASE_KEY, details => {
    dataPostOffice(POST_MESSAGE_PURCHASE_KEY, details)
  })

  // relay the most current account address to the checkout UI
  addDataMessageHandler(POST_MESSAGE_UPDATE_ACCOUNT, account => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_ACCOUNT, account)
  })

  // relay the most current account balance to the checkout UI
  addDataMessageHandler(POST_MESSAGE_UPDATE_ACCOUNT_BALANCE, balance => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_ACCOUNT_BALANCE, balance)
  })

  // relay the most current lock objects to the checkout UI
  addDataMessageHandler(POST_MESSAGE_UPDATE_LOCKS, locks => {
    savedLocks = locks // to use for determining when to hide the checkout iframe
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_LOCKS, locks)
  })

  // relay the user's wallet's current network, in order to
  // display errors if it is on the wrong network
  addDataMessageHandler(POST_MESSAGE_UPDATE_NETWORK, network => {
    CheckoutUIPostOffice(POST_MESSAGE_UPDATE_NETWORK, network)
  })
}
