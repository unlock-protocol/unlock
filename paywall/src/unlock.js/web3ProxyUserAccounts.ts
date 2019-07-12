import { MapHandlers, MessageHandlerTemplates } from './setupIframeMailbox'
import { PostMessages, MessageTypes } from '../messageTypes'
import { proxyProvider, validateMethodCall } from './proxyProvider'

/**
 * Proxy calls to web3 from postMessage
 *
 * @param {window} window the main window object
 * @param {element} iframe the iframe element, created by document.createElement('iframe')
 * @param {string} origin the iframe element's URL origin
 */
export default function web3ProxyUserAccounts(
  mapHandlers: MapHandlers,
  initialProxyAccount: string | null,
  proxyNetwork: number | string
) {
  let proxyAccount = initialProxyAccount
  // we need to listen for the account iframe's READY event, and request the current account and network
  const accountHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.UPDATE_ACCOUNT]: () => {
      return account => {
        proxyAccount = account
      }
    },
    [PostMessages.INITIATED_TRANSACTION]: postMessage => {
      return () => {
        // prompt the data iframe to refresh transactions
        postMessage('data', PostMessages.INITIATED_TRANSACTION, undefined)
      }
    },
  }

  const dataHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.WEB3]: postMessage => {
      return async payload => {
        if (!validateMethodCall(payload)) return

        // we are using the user account
        proxyProvider({
          payload,
          proxyAccount,
          proxyNetwork,
          postMessage,
        })
      }
    },
  }

  const checkoutHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.PURCHASE_KEY]: postMessage => {
      return details => {
        // relay a request to purchase a key to the data iframe
        // as the user has clicked on a key in the checkout UI
        // we are using unlock account, so send to the account iframe instead
        postMessage('account', PostMessages.PURCHASE_KEY, details)
      }
    },
  }

  mapHandlers('data', dataHandlers)
  mapHandlers('account', accountHandlers)
  mapHandlers('checkout', checkoutHandlers)
}
