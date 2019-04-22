/* eslint no-console: 0 */
import nock from 'nock'

export class NockHelper {
  constructor(endpoint, debug = false) {
    this.nockScope = nock(endpoint, { encodedQueryParams: true })

    this.debug = debug
    this._rpcRequestId = 0

    // In order to monitor traffic without intercepting it (so that mocks can be built). uncomment the lone below
    // nock.recorder.rec()

    nock.emitter.on('no match', function(clientRequestObject, options, body) {
      if (debug) {
        console.log(`NO HTTP MOCK EXISTS FOR THAT REQUEST\n${body}`)
      }
    })
    // without binding, "this.debug" in locNock will not refer to our NockHelper
    this.logNock = this.logNock.bind(this)
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
    return this.nockScope
      .post('/', { jsonrpc: '2.0', id: this._rpcRequestId, method, params })
      .reply(200, { id: this._rpcRequestId, jsonrpc: '2.0', result, error })
      .log(this.logNock)
  }

  // net_version
  netVersionAndYield(netVersion) {
    return this._jsonRpcRequest('net_version', [], netVersion)
  }

  // eth_call
  ethCallAndYield(data, to, result) {
    return this._jsonRpcRequest('eth_call', [{ data, to }, 'latest'], result)
  }

  // eth_getBalance
  getBalanceForAccountAndYieldBalance(account, balance) {
    return this._jsonRpcRequest(
      'eth_getBalance',
      [account.toLowerCase(), 'latest'],
      balance
    )
  }

  // eth_blockNumber
  ethBlockNumber(result) {
    return this._jsonRpcRequest('eth_blockNumber', [], result)
  }

  // eth_getTransactionByHash
  ethGetTransactionByHash(hash, result) {
    return this._jsonRpcRequest('eth_getTransactionByHash', [hash], result)
  }

  // eth_getTransactionReceipt
  ethGetTransactionReceipt(hash, result) {
    return this._jsonRpcRequest('eth_getTransactionReceipt', [hash], result)
  }

  // eth_call
  ethCallAndFail(data, to, error) {
    return this._jsonRpcRequest(
      'eth_call',
      [{ data, to }, 'latest'],
      undefined,
      error
    )
  }

  // eth_accounts
  accountsAndYield(accounts) {
    return this._jsonRpcRequest('eth_accounts', [], accounts)
  }

  // eth_getCode
  ethGetCodeAndYield(address, opCode) {
    return this._jsonRpcRequest(
      'eth_getCode',
      [address.toLowerCase(), 'latest'],
      opCode
    )
  }
}

export default NockHelper
