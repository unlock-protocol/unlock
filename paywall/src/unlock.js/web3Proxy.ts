import { Web3Window, web3MethodCall } from '../windowTypes'
import { MapHandlers, MessageHandlerTemplates } from './setupIframeMailbox'
import { PostMessages, MessageTypes } from '../messageTypes'
import { waitFor } from '../utils/promises'
import { hideIframe, showIframe } from './iframeManager'

let hasWeb3 = true

export function enable(window: Web3Window) {
  return new window.Promise((resolve, reject) => {
    if (!window.web3 || !window.web3.currentProvider) {
      return reject(new ReferenceError('no web3 wallet exists'))
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

interface UnvalidatedPayload {
  method?: any
  id?: any
  params?: any
}
export function validateMethodCall(payload: UnvalidatedPayload) {
  if (!payload || typeof payload !== 'object') return
  if (!payload.method || typeof payload.method !== 'string') {
    return false
  }
  if (!payload.params || !Array.isArray(payload.params)) {
    return false
  }
  if (typeof payload.id !== 'number' || Math.round(payload.id) !== payload.id) {
    return false
  }
  return true
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
  let proxyAccount: null | string = null
  let proxyNetwork: string | number
  let accountIframeReady = false
  // we need to listen for the account iframe's READY event, and request the current account and network
  const accountHandlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.READY]: postMessage => {
      return () => {
        postMessage('account', PostMessages.SEND_UPDATES, 'account')
        postMessage('account', PostMessages.SEND_UPDATES, 'network')
      }
    },
    [PostMessages.UPDATE_ACCOUNT]: () => {
      return account => {
        proxyAccount = account
        accountIframeReady = true
      }
    },
    [PostMessages.UPDATE_NETWORK]: () => {
      return network => {
        proxyNetwork = network
      }
    },
    [PostMessages.SHOW_ACCOUNTS_MODAL]: (
      _postMessage,
      _dataIframe,
      _checkoutIframe,
      accountIframe
    ) => {
      return () => {
        showIframe(window, accountIframe)
      }
    },
    [PostMessages.HIDE_ACCOUNT_MODAL]: (
      _postMessage,
      _dataIframe,
      _checkoutIframe,
      accountIframe
    ) => {
      return () => {
        hideIframe(window, accountIframe)
      }
    },
  }

  const handlers: MessageHandlerTemplates<MessageTypes> = {
    [PostMessages.READY_WEB3]: postMessage => {
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
          await enable(window)
          hasWeb3 = true
          postMessage('data', PostMessages.WALLET_INFO, {
            noWallet: false,
            notEnabled: false,
            isMetamask, // this is used for some decisions in signing
          })
        } catch (e) {
          //console.log('uncomment this line if no wallet tests fail', e)
          hasWeb3 = false
          const noWallet = e instanceof ReferenceError
          if (noWallet) {
            // we don't have web3, wait for the account iframe, then respond
            await waitFor(() => accountIframeReady)
            if (proxyAccount) {
              // we will use the proxy account!
              hasWeb3 = true
              postMessage('data', PostMessages.WALLET_INFO, {
                noWallet: false,
                notEnabled: false,
                isMetamask: false, // this is used for some decisions in signing
              })
              return
            }
          }
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
        if (!hasWeb3) {
          return postMessage('data', PostMessages.WEB3, {
            id: payload.id,
            error: 'No web3 wallet is available',
            result: null,
          })
        }

        if (!validateMethodCall(payload)) return

        const { method, params, id }: web3MethodCall = payload
        if (proxyAccount) {
          // we are using the user account
          if (!validateMethodCall(payload)) return
          const { method, id }: web3MethodCall = payload
          switch (method) {
            case 'eth_accounts':
              postMessage('data', PostMessages.WEB3_RESULT, {
                id,
                error: null,
                result: [proxyAccount],
              })
              break
            case 'net_version':
              postMessage('data', PostMessages.WEB3_RESULT, {
                id,
                error: null,
                result: proxyNetwork,
              })
              break
            default:
              postMessage('data', PostMessages.WEB3_RESULT, {
                id: payload.id,
                error: `"${method}" is not supported`,
                result: null,
              })
          }
          return // do not attempt to call send on the current provider
        }
        // we use call to bind the call to the current provider
        send &&
          send.call(
            window.web3 && window.web3.currentProvider,
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
        if (proxyAccount) {
          // we are using unlock account, so send to the account iframe instead
          postMessage('account', PostMessages.PURCHASE_KEY, details)
        } else {
          postMessage('data', PostMessages.PURCHASE_KEY, details)
        }
      }
    },
  }

  mapHandlers('data', handlers)
  mapHandlers('account', accountHandlers)
  mapHandlers('checkout', checkoutHandlers)
}
