import { enable } from '../paywall-builder/config'
import { mainWindowPostOffice } from '../utils/postOffice'
import {
  POST_MESSAGE_WEB3,
  POST_MESSAGE_READY_WEB3,
  POST_MESSAGE_WALLET_INFO,
} from '../paywall-builder/constants'
import { Web3Window, IframeType, web3MethodCall } from '../windowTypes'

let hasWeb3 = true

/**
 * Proxy calls to web3 from postMessage
 *
 * @param {window} window the main window object
 * @param {element} iframe the iframe element, created by document.createElement('iframe')
 * @param {string} origin the iframe element's URL origin
 */
export default function web3Proxy(
  window: Web3Window,
  iframe: IframeType,
  origin: string
) {
  const { addHandler } = mainWindowPostOffice(
    window,
    iframe,
    origin,
    'web3 proxy',
    'Web3ProxyProvider'
  )
  // use sendAsync if available, otherwise we will use send
  const send =
    window.web3 &&
    window.web3.currentProvider &&
    (window.web3.currentProvider.sendAsync || window.web3.currentProvider.send)

  // handler for the actual web3 calls
  addHandler(POST_MESSAGE_WEB3, (payload, respond) => {
    if (!hasWeb3 || !window.web3) {
      return respond(POST_MESSAGE_WEB3, {
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
        (error, result) => {
          respond(POST_MESSAGE_WEB3, { id, error, result })
        }
      )
  })

  // initialize, we do this once the iframe is ready to receive information on the wallet
  // we need to tell the iframe if the wallet is metamask
  // TODO: pass the name of the wallet if we know it? (secondary importance right now, so omitting)
  addHandler(POST_MESSAGE_READY_WEB3, async (_, respond) => {
    const isMetamask = !!(
      window.web3 &&
      window.web3.currentProvider &&
      window.web3.currentProvider.isMetamask
    )
    try {
      await enable(window)
      hasWeb3 = true
      respond(POST_MESSAGE_WALLET_INFO, {
        noWallet: false,
        notEnabled: false,
        isMetamask, // this is used for some decisions in signing
      })
    } catch (e) {
      // we don't have web3
      hasWeb3 = false
      const noWallet = e instanceof ReferenceError
      const notEnabled = !noWallet
      respond(POST_MESSAGE_WALLET_INFO, {
        noWallet,
        notEnabled,
        isMetamask,
      })
    }
  })
}
