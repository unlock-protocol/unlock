/* eslint no-console: 0 */
import nock from 'nock'

// In order to monitor traffic without intercepting it (so that mocks can be built). uncomment the line below

export class NockHelper {
  constructor(endpoint, debug = false, record = false) {
    this.nockScope = nock(endpoint, { encodedQueryParams: true })

    this.recording = record
    if (record) {
      nock.recorder.rec({
        output_objects: true,
      })
    }

    this.anyRequestSetUp = false
    this.debug = debug
    // ethers hard-codes this value, see https://github.com/ethers-io/ethers.js/issues/489
    this._rpcRequestId = 42
    this._noMatches = []

    nock.emitter.on('no match', (clientRequestObject, options, body) => {
      this._noMatches.push(body)
      if (debug) {
        if (!this.anyRequestSetUp) {
          console.log(
            new Error('No mocks have been set up, but a request was made!')
          )
        }
        if (!body) {
          console.log(
            new Error(
              'no body? (is there a jest.fakeTimers call? you must reset mocks' +
                ', see https://github.com/sapegin/jest-cheat-sheet#clearing-and-restoring-mocks'
            )
          )
        }
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
    if (!this.recording) {
      nock.restore()
      nock.activate()
    }
    this._noMatches = []
  }

  resolveWhenAllNocksUsed() {
    return new Promise((resolve, reject) => {
      let counter = 0
      setTimeout(() => {
        if (nock.isDone()) {
          resolve()
        }
        if (counter++ > 100) {
          try {
            this.ensureAllNocksUsed()
          } catch (e) {
            reject(e)
          }
        }
      }, 10)
    })
  }

  getUnusedNocks() {
    if (nock.isDone()) return []
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
    return unused[0]
  }

  displayUnusedNocks() {
    const unused = this.getUnusedNocks()
    console.log(`${unused.length} Unused nocks:`)
    unused.forEach(info => {
      console.log('API call', info.api)
      console.log('return', info.reply)
    })
  }

  nockCount() {
    console.log(`${this.getUnusedNocks().length} Unused nocks`)
  }

  ensureAllNocksUsed() {
    if (!nock.isDone()) {
      this.displayUnusedNocks()
      throw new Error('Not all JSON-RPC call mocks were used!')
    }
    if (this._noMatches.length) {
      throw new Error('Some JSON-RPC calls did not match!')
    }
  }

  // Generic call
  _jsonRpcRequest(method, params, result, error) {
    this.anyRequestSetUp = true // detect http calls made before any mocks setup
    const cb = (...args) => this.logNock(args)
    return this.nockScope
      .post('/', body => {
        return body.jsonrpc === '2.0' && body.method === method
      })
      .reply(200, {id: this._rpcRequestId, jsonrpc: '2.0', result, error})
      .log(cb)
  }

  do404(method, params) {
    this.anyRequestSetUp = true // detect http calls made before any mocks setup
    const cb = (...args) => this.logNock(args)
    return this.nockScope
      .post('/', { jsonrpc: '2.0', id: this._rpcRequestId, method, params })
      .reply(404, '404 Not Found')
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
  getBalanceForAccountAndYieldBalance(account, balance, error) {
    return this._jsonRpcRequest(
      'eth_getBalance',
      [account.toLowerCase(), 'latest'],
      balance,
      error
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
  ethGetTransactionReceipt(hash, result, error) {
    return this._jsonRpcRequest(
      'eth_getTransactionReceipt',
      [hash],
      result,
      error
    )
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
          ...(gasPrice ? { gasPrice } : {}),
        },
      ],
      result,
      error
    )
  }

  personalSignAndYield(hash, account, result, error) {
    return this._jsonRpcRequest('personal_sign', [hash, account], result, error)
  }

  ethSignAndYield(hash, account, result, error) {
    return this._jsonRpcRequest('eth_sign', [account, hash], result, error)
  }

  ethSignTypedDataAndYield(account, data, result, error) {
    return this._jsonRpcRequest(
      'eth_signTypedData',
      [account, data],
      result,
      error
    )
  }

  ethSignTypedDatav3AndYield(account, data, result, error) {
    return this._jsonRpcRequest(
      'eth_signTypedData_v3',
      [account, data],
      result,
      error
    )
  }

  ethEstimateGas(from, to, data, result) {
    return this._jsonRpcRequest(
      'eth_estimateGas',
      [
        {
          from,
          to,
          data,
        },
      ],
      result
    )
  }

  getTransactionCount(address, count) {
    return this._jsonRpcRequest(
      'eth_getTransactionCount',
      [address, 'latest'],
      count
    )
  }
}

export default NockHelper
