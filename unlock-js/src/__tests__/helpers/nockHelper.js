/* eslint no-console: 0 */
import nock from 'nock'

export class NockHelper {
  constructor(endpoint, debug = false) {
    this.nockScope = nock(endpoint, { encodedQueryParams: true })

    this.debug = debug
    this._rpcRequestId = 0
  }

  logNock(...args) {
    if (this.debug) {
      console.log(...args)
    }
  }

  cleanAll() {
    nock.cleanAll()
  }

  // Generic call
  _jsonRpcRequest(method, params, result, error) {
    this._rpcRequestId += 1
    this.nockScope
      .post('/', { jsonrpc: '2.0', id: this._rpcRequestId, method, params })
      .reply(200, { id: this._rpcRequestId, jsonrpc: '2.0', result, error })
      .log(this.logNock)
  }

  // net_version
  netVersionAndYield(netVersion) {
    return this._jsonRpcRequest('net_version', [], netVersion)
  }
}

export default NockHelper
