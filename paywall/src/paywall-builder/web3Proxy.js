import { enable } from './config'
import { mainWindowPostOffice, setHandler } from '../utils/postOffice'
import {
  POST_MESSAGE_READY,
  POST_MESSAGE_WEB3,
  POST_MESSAGE_WALLET_INFO,
} from './constants'

let hasWeb3 = true

export default function web3Proxy(window, iframe, origin) {
  mainWindowPostOffice(window, iframe, origin)

  setHandler(POST_MESSAGE_WEB3, (payload, respond) => {
    if (!hasWeb3) {
      return respond(POST_MESSAGE_WEB3, {
        id,
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

    const { method, params, id } = payload
    window.web3.currentProvider.send(
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

  setHandler(POST_MESSAGE_READY, async (_, respond) => {
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
