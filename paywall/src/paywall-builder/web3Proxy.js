import { enable } from './config'
import { POST_MESSAGE_READY, POST_MESSAGE_WEB3 } from './constants'

let hasWeb3 = true

export default function web3Proxy(window, iframe, origin) {
  window.addEventListener('message', async event => {
    if (event.origin !== origin || event.source !== iframe.contentWindow) {
      // nice try, hackers
      return
    }
    if (event.data === POST_MESSAGE_READY) {
      try {
        await enable(window)
        hasWeb3 = true
      } catch (e) {
        // we don't have web3
        hasWeb3 = false
      }
    }

    if (!event.data || typeof event.data !== 'object') return
    if (!event.data.type) return
    if (!event.data.payload || typeof event.data.payload !== 'object') return
    if (
      !event.data.payload.method ||
      typeof event.data.payload.method !== 'string'
    ) {
      return
    }
    if (
      !event.data.payload.params ||
      Array.isArray(event.data.payload.params)
    ) {
      return
    }
    if (
      typeof event.data.payload.id !== 'number' ||
      Math.round(event.data.payload.id) !== event.data.payload.id
    ) {
      return
    }
    if (event.data.type === POST_MESSAGE_WEB3) {
      const { method, params, id } = event.data.payload
      if (!hasWeb3) {
        return iframe.contentWindow.postMessage({
          type: POST_MESSAGE_WEB3,
          payload: { id, error: 'No web3 wallet exists', result: null },
        })
      }
      window.web3.currentProvider.send(
        {
          method,
          params,
          jsonrpc: '2.0',
          id,
        },
        (error, result) => {
          iframe.contentWindow.postMessage({
            type: POST_MESSAGE_WEB3,
            payload: { id, error, result },
          })
        }
      )
    }
  })
}
