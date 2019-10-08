import { web3MethodCall, web3MethodResult } from '../../windowTypes'
import {
  WEB3_CALL,
  web3Call,
  web3Result,
  WEB3_RESULT,
} from '../../actions/web3call'

describe('web3Call action', () => {
  it('should create an action representing a JSON-RPC call', () => {
    expect.assertions(1)

    const payload: web3MethodCall = {
      method: 'personal_sign',
      params: [],
      id: 1337,
      jsonrpc: '2.0',
    }

    expect(web3Call(payload)).toEqual({
      type: WEB3_CALL,
      payload,
    })
  })
})

describe('web3Result action', () => {
  it('should create an action representing a successful result for a JSON-RPC call', () => {
    expect.assertions(1)

    const payload: web3MethodResult = {
      id: 1337,
      jsonrpc: '2.0',
      result: {
        id: 1337,
        jsonrpc: '2.0',
        result: 'the number twelve',
      },
    }

    expect(web3Result(payload)).toEqual({
      type: WEB3_RESULT,
      payload,
    })
  })

  it('should create an action representing an error result for a JSON-RPC call', () => {
    expect.assertions(1)

    const payload: web3MethodResult = {
      id: 1337,
      jsonrpc: '2.0',
      error: 'bees in the datacenter',
    }

    expect(web3Result(payload)).toEqual({
      type: WEB3_RESULT,
      payload,
    })
  })
})
