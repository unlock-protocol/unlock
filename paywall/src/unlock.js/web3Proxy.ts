import { Web3Window, web3MethodCall, IframeType } from '../windowTypes'
import {
  MapHandlers,
  MessageHandlerTemplates,
  PostMessageToIframe,
} from './setupIframeMailbox'
import { PostMessages, MessageTypes } from '../messageTypes'

let hasWeb3 = true
const NO_WEB3 = 'no web3 wallet'

export function enable(window: Web3Window) {
  return new window.Promise((resolve, reject) => {
    if (!window.web3 || !window.web3.currentProvider) {
      return resolve(NO_WEB3)
    }
    if (!window.web3.currentProvider.enable) return resolve()
    window.web3.currentProvider
      .enable()
      .then(() => {
        return resolve()
      })
      .catch((e: any) => {
        reject(e)
      })
  })
}

/**
 * Proxy calls to web3 from postMessage
 *
 * @param {window} window the main window object
 * @param {element} iframe the iframe element, created by document.createElement('iframe')
 * @param {string} origin the iframe element's URL origin
 */
export default function web3Proxy(
  window: Web3Window,
  mapHandlers: MapHandlers
) {
  // use sendAsync if available, otherwise we will use send
  const send =
    window.web3 &&
    window.web3.currentProvider &&
    (window.web3.currentProvider.sendAsync || window.web3.currentProvider.send)

  // TODO: this will hold the logic for enabling the user account wallet
  const checkForUserAccountWallet = async (
    _: IframeType,
    postMessage: PostMessageToIframe<MessageTypes>
  ) => {
    // we don't have web3
    hasWeb3 = false
    postMessage('data', PostMessages.WALLET_INFO, {
      noWallet: true,
      notEnabled: false,
      isMetamask: false,
    })
  }

  const handlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.READY_WEB3]: (
      postMessage,
      _dataIframe,
      _checkoutIframe,
      accountIframe
    ) => {
      return async () => {
        // initialize, we do this once the iframe is ready to receive information on the wallet
        // we need to tell the iframe if the wallet is metamask
        // TODO: pass the name of the wallet if we know it? (secondary importance right now, so omitting)
        const isMetamask = !!(
          window.web3 &&
          window.web3.currentProvider &&
          window.web3.currentProvider.isMetamask
        )
        try {
          const result = await enable(window)
          if (result === NO_WEB3) {
            checkForUserAccountWallet(accountIframe, postMessage)
            return
          }
          hasWeb3 = true
          postMessage('data', PostMessages.WALLET_INFO, {
            noWallet: false,
            notEnabled: false,
            isMetamask, // this is used for some decisions in signing
          })
        } catch (e) {
          // we don't have web3
          hasWeb3 = false
          const noWallet = e instanceof ReferenceError
          const notEnabled = !noWallet
          postMessage('data', PostMessages.WALLET_INFO, {
            noWallet,
            notEnabled,
            isMetamask,
          })
        }
      }
    },
    [PostMessages.WEB3]: postMessage => {
      return async payload => {
        // handler for the actual web3 calls
        if (!hasWeb3 || !window.web3) {
          return postMessage('data', PostMessages.WEB3, {
            id: payload.id,
            error: 'No web3 wallet is available',
            result: null,
          })
        }

        if (!payload || typeof payload !== 'object') return
        if (!payload.method || typeof payload.method !== 'string') {
          return
        }
        if (!payload.params || !Array.isArray(payload.params)) {
          return
        }
        if (
          typeof payload.id !== 'number' ||
          Math.round(payload.id) !== payload.id
        ) {
          return
        }

        const { method, params, id }: web3MethodCall = payload
        // we use call to bind the call to the current provider
        send &&
          send.call(
            window.web3.currentProvider,
            {
              method,
              params,
              jsonrpc: '2.0',
              id,
            },
            (error: string | null, result: any) => {
              postMessage('data', PostMessages.WEB3_RESULT, {
                id,
                error,
                result,
              })
            }
          )
      }
    },
  }

  const checkoutHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.PURCHASE_KEY]: postMessage => {
      return details => {
        // relay a request to purchase a key to the data iframe
        // as the user has clicked on a key in the checkout UI
        postMessage('data', PostMessages.PURCHASE_KEY, details)
      }
    },
  }

  mapHandlers('data', handlers)
  mapHandlers('checkout', checkoutHandlers)
}
