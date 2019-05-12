import { getRouteFromWindow } from '../utils/routes'
import {
  POST_MESSAGE_WEB3,
  POST_MESSAGE_READY,
  POST_MESSAGE_WALLET_INFO,
} from '../paywall-builder/constants'

export default class Web3ProxyProvider {
  constructor(window) {
    this.parent = window.parent
    const { origin } = getRouteFromWindow(window)
    this.origin = origin
    this.id = 0
    this.requests = new Map()

    window.addEventListener('message', event => {
      // **SECURITY CHECKS**
      // ignore messages that do not come from our parent window
      if (event.source !== parent || event.origin !== origin) return
      // data must be of shape { type: 'type', payload: <value> }
      if (!event.data || !event.data.type) return
      if (!event.data.payload || typeof event.data.payload !== 'object') return
      if (typeof event.data.type !== 'string') return
      if (event.data === POST_MESSAGE_WALLET_INFO) {
        if (!event.data.payload || typeof event.data.payload !== 'object')
          return
        this.isMetamask = !!event.data.payload.isMetamask
      }

      if (event.data.type !== POST_MESSAGE_WEB3) return
      if (
        !event.data.payload.hasOwnProperty('error') ||
        !event.data.payload.hasOwnProperty('result') ||
        !event.data.payload.hasOwnProperty('id')
      ) {
        return
      }
      const { id, result, error } = event.data.payload
      if (!this.requests.has(id)) {
        // no pending request with that id
        return
      }
      const callback = this.requests.get(id)
      this.requests.remove(id)
      result.id = 42 // ethers needs to not do this...
      callback(error, result)
    })
    this.parent.postMessage(POST_MESSAGE_READY)
  }

  async sendAsync({ method, params }, callback) {
    const id = ++this.id // ethers always uses 42, so we will use our own id
    this.requests.set(id, callback)
    const payload = {
      method,
      params,
      id,
    }
    this.parent.postMessage({ type: POST_MESSAGE_WEB3, payload }, origin)
  }
}
