import { web3MethodCall } from '../../windowTypes'
import { WEB3_CALL, web3Call } from '../../actions/web3call'

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
