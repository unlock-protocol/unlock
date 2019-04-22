/* eslint no-console: 0 */
import nock from 'nock'

export class NockHelper {
  constructor(endpoint, debug = false) {
    this.nockScope = nock(endpoint, { encodedQueryParams: true })

    this.debug = debug
    this._rpcRequestId = 0
    this._noMatches = []
    this._pendingMocks = []

    // In order to monitor traffic without intercepting it (so that mocks can be built). uncomment the line below
    // nock.recorder.rec()

    nock.emitter.on('no match', (clientRequestObject, options, body) => {
      this._noMatches.push(body)
      if (debug) {
        console.log(`NO HTTP MOCK EXISTS FOR THAT REQUEST\n${body}`)
      }
    })
    // without binding, "this.debug" in locNock will not refer to our NockHelper
    this.logNock = this.logNock.bind(this)
    this.ensureAllNocksUsed = this.ensureAllNocksUsed.bind(this)
    this.cleanAll = this.cleanAll.bind(this)
  }

  logNock(args) {
    if (this.debug) {
      console.log(...args)
    }
  }

  cleanAll() {
    nock.cleanAll()
    nock.restore()
    nock.activate()
    this._noMatches = []
    this._pendingMocks = []
  }

  ensureAllNocksUsed() {
    if (!nock.isDone()) {
      const unused = Object.values(this.nockScope.keyedInterceptors).map(
        interceptors =>
          interceptors
            .map(interceptor => {
              return (
                interceptor.interceptionCounter === 0 && {
                  api: interceptor._requestBody,
                  reply: interceptor.body,
                }
              )
            })
            .filter(a => a)
      )
      unused.sort((a, b) => {
        return a.api.id < b.api.id ? -1 : 1
      })
      console.log('Unused nocks:')
      unused.forEach(infos => {
        infos.forEach(info => {
          console.log('API call', info.api)
          console.log('return', info.reply)
        })
      })
      throw new Error('Not all JSON-RPC call mocks were used!')
    }
    if (this._noMatches.length) {
      throw new Error('Some JSON-RPC calls did not match!')
    }
  }

  // Generic call
  _jsonRpcRequest(method, params, result, error) {
    this._rpcRequestId += 1
    const cb = (...args) => this.logNock(args)
    return this.nockScope
      .post('/', { jsonrpc: '2.0', id: this._rpcRequestId, method, params })
      .reply(200, { id: this._rpcRequestId, jsonrpc: '2.0', result, error })
      .log(cb)
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
  ethGetCodeAndYield(address, opCode, error) {
    return this._jsonRpcRequest(
      'eth_getCode',
      [address.toLowerCase(), 'latest'],
      opCode,
      error
    )
  }

  // eth_gasPrice
  ethGasPriceAndYield(price) {
    return this._jsonRpcRequest('eth_gasPrice', [], price)
  }

  // eth_sendTransaction
  ethSendTransactionAndYield(transaction, gasPrice, result, error) {
    return this._jsonRpcRequest(
      'eth_sendTransaction',
      [
        {
          ...transaction,
          gasPrice,
        },
      ],
      result,
      error
    )
  }
}

export default NockHelper
