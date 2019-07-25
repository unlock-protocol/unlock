import {
  validateMethodCall,
  proxyProvider,
  UnvalidatedPayload,
} from '../../unlock.js/proxyProvider'
import { MessageTypes, PostMessages } from '../../messageTypes'
import { PostMessageToIframe } from '../../unlock.js/setupIframeMailbox'
import { waitFor } from '../../utils/promises'

describe('user accounts proxy provider', () => {
  describe('validateMethodCall', () => {
    describe('failures', () => {
      it('should fail on invalid method calls', () => {
        expect.assertions(19)

        const badCalls = [
          false,
          null,
          0,
          NaN,
          'hi',
          {},
          { method: 1 },
          { method: [] },
          { method: null },
          { method: {} },
          { method: 'hi' },
          { method: 'hi', params: 1 },
          { method: 'hi', params: 'oops' },
          { method: 'hi', params: {} },
          { method: 'hi', params: [] },
          { method: 'hi', params: [], id: NaN },
          { method: 'hi', params: [], id: 'oops' },
          { method: 'hi', params: [], id: {} },
          { method: 'hi', params: [], id: [] },
        ]

        badCalls.forEach((input: any) => {
          expect(validateMethodCall(input)).toBe(false)
        })
      })

      it('should succeed on a valid method call', () => {
        expect.assertions(1)

        expect(
          validateMethodCall({
            method: 'hi',
            params: [1],
            id: 1,
          })
        ).toBe(true)
      })
    })
  })

  describe('proxyProvider', () => {
    interface MockMessage extends PostMessageToIframe<MessageTypes> {
      mock?: any
    }
    const proxyAccount = 'hi'
    const proxyNetwork = 2
    let postMessage: MockMessage

    async function callProxyProvider(payload: UnvalidatedPayload) {
      proxyProvider({
        proxyAccount,
        proxyNetwork,
        postMessage,
        payload,
      })

      await waitFor(() => postMessage.mock.calls.length)
    }

    beforeEach(() => {
      postMessage = jest.fn()
    })

    it('should do nothing with an invalid method call', async () => {
      expect.assertions(1)

      proxyProvider({
        proxyAccount,
        proxyNetwork,
        postMessage,
        payload: {
          method: 'eth_accounts',
          id: 2,
          jsonrpc: '2.0',
          params: {},
        },
      })

      // ensure we have run the course without responding
      await new Promise(resolve => setTimeout(resolve, 1000))

      expect(postMessage).not.toHaveBeenCalled()
    })

    it('should post a reply with the proxy account for eth_accounts', async () => {
      expect.assertions(1)

      await callProxyProvider({
        method: 'eth_accounts',
        id: 2,
        jsonrpc: '2.0',
        params: [],
      })

      expect(postMessage).toHaveBeenCalledWith(
        'data',
        PostMessages.WEB3_RESULT,
        {
          id: 2,
          jsonrpc: '2.0',
          result: { id: 2, jsonrpc: '2.0', result: [proxyAccount] },
        }
      )
    })

    it('should post a reply with the proxy network for net_version', async () => {
      expect.assertions(1)

      await callProxyProvider({
        method: 'net_version',
        id: 23,
        jsonrpc: '2.0',
        params: [],
      })

      expect(postMessage).toHaveBeenCalledWith(
        'data',
        PostMessages.WEB3_RESULT,
        {
          id: 23,
          jsonrpc: '2.0',
          result: { id: 23, jsonrpc: '2.0', result: proxyNetwork },
        }
      )
    })

    it('should post an error reply for any other method call', async () => {
      expect.assertions(1)

      await callProxyProvider({
        method: 'gibberish',
        id: 23,
        jsonrpc: '2.0',
        params: [],
      })

      expect(postMessage).toHaveBeenCalledWith(
        'data',
        PostMessages.WEB3_RESULT,
        {
          id: 23,
          jsonrpc: '2.0',
          error: '"gibberish" is not supported',
        }
      )
    })
  })
})
