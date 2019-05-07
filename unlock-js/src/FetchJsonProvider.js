import { providers } from 'ethers'

const whoAmI = global || self

function getResult(payload) {
  if (payload.error) {
    const error = new Error(payload.error.message)
    error.code = payload.error.code
    error.data = payload.error.data
    throw error
  }

  return payload.result
}

export default class FetchJsonProvider extends providers.JsonRpcProvider {
  async send(method, params) {
    if (!whoAmI.fetch) {
      return providers.JsonRpcProvider.prototype.send.call(this, method, params)
    }
    const request = {
      method: method,
      params: params,
      id: 42,
      jsonrpc: '2.0',
    }

    const toFetch =
      this.connection.url.indexOf('http') !== -1
        ? this.connection.url
        : whoAmI.location.protocol + '//' + this.connection.url
    const response = await fetch(toFetch, {
      body: JSON.stringify(request),
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
    }
    const processed = await response.json()
    const result = getResult(processed)
    this.emit('debug', {
      action: 'send',
      request: request,
      response: result,
      provider: this,
    })
    return result
  }
}
