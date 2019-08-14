import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import DataIframeMessageEmitter from '../../../unlock.js/PostMessageEmitters/DataIframeMessageEmitter'
import { PostMessages, ExtractPayload } from '../../../messageTypes'
import { web3MethodCall } from '../../../windowTypes'

describe('DataIframeMessageEmitter', () => {
  let fakeWindow: FakeWindow
  const dataOrigin = 'http://fun.times'

  function makeEmitter(fakeWindow: FakeWindow) {
    const emitter = new DataIframeMessageEmitter(
      fakeWindow,
      'http://fun.times/fakey'
    )
    emitter.setupListeners()
    return emitter
  }

  describe('emitter construction', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should create a data iframe', () => {
      expect.assertions(2)

      const emitter = makeEmitter(fakeWindow)

      expect(emitter.iframe.src).toBe('http://fun.times/fakey')
      expect(emitter.iframe.name).toBe('unlock data')
    })

    it('should add the data iframe to the document', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      expect(
        fakeWindow.document.body.insertAdjacentElement
      ).toHaveBeenCalledWith('afterbegin', emitter.iframe)
    })

    it('should set up postMessage', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      emitter.postMessage(PostMessages.SCROLL_POSITION, 5)

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.SCROLL_POSITION,
        5,
        emitter.iframe,
        dataOrigin // iframe origin
      )
    })

    it('should set up addHandler', () => {
      expect.assertions(1)

      const fakeReady = jest.fn()
      const emitter = makeEmitter(fakeWindow)

      emitter.addHandler(PostMessages.READY, fakeReady)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY,
        undefined,
        emitter.iframe,
        dataOrigin
      )

      expect(fakeReady).toHaveBeenCalled()
    })
  })

  describe('setupListeners', () => {
    let ready: () => void

    beforeEach(() => {
      fakeWindow = new FakeWindow()
      ready = jest.fn()
    })

    type VoidMessages = [
      string,
      PostMessages.READY | PostMessages.READY_WEB3 | PostMessages.LOCKED
    ][]
    it.each(<VoidMessages>[
      ['READY', PostMessages.READY],
      ['READY_WEB3', PostMessages.READY_WEB3],
      ['LOCKED', PostMessages.LOCKED],
    ])('should emit PostMessages.%s upon receiving it', (_, message) => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      emitter.on(message, ready)

      fakeWindow.receivePostMessageFromIframe(
        message,
        undefined,
        emitter.iframe,
        dataOrigin
      )

      expect(ready).toHaveBeenCalled()
    })

    interface PayloadMessageTypes {
      [PostMessages.UNLOCKED]: ExtractPayload<PostMessages.UNLOCKED>
      [PostMessages.ERROR]: ExtractPayload<PostMessages.ERROR>
      [PostMessages.UPDATE_WALLET]: ExtractPayload<PostMessages.UPDATE_WALLET>
      [PostMessages.WEB3]: ExtractPayload<PostMessages.WEB3>
      [PostMessages.UPDATE_ACCOUNT]: ExtractPayload<PostMessages.UPDATE_ACCOUNT>
      [PostMessages.UPDATE_ACCOUNT_BALANCE]: ExtractPayload<
        PostMessages.UPDATE_ACCOUNT_BALANCE
      >
      [PostMessages.UPDATE_NETWORK]: ExtractPayload<PostMessages.UPDATE_NETWORK>
      [PostMessages.UPDATE_LOCKS]: ExtractPayload<PostMessages.UPDATE_LOCKS>
    }
    type Messages = keyof PayloadMessageTypes
    type PayloadMessages<T extends Messages = Messages> = [
      string,
      T,
      PayloadMessageTypes[T]
    ][]
    const lockAddresses = ['lock1']
    const web3Request = {
      id: 1,
      jsonrpc: '2.0',
      params: [],
      method: 'eth_getAccounts',
    }
    const locks: ExtractPayload<PostMessages.UPDATE_LOCKS> = {
      lock: {
        address: 'lock',
        name: 'a lock',
        currencyContractAddress: null,
        keyPrice: '123',
        expirationDuration: 123,
        key: {
          lock: 'lock',
          expiration: 0,
          status: 'none',
          transactions: [],
          confirmations: 0,
          owner: 'account',
        },
      },
    }
    it.each(<PayloadMessages>[
      ['UNLOCKED', PostMessages.UNLOCKED, lockAddresses],
      ['ERROR', PostMessages.ERROR, 'error message'],
      ['UPDATE_WALLET', PostMessages.UPDATE_WALLET, true],
      ['WEB3', PostMessages.WEB3, web3Request],
      ['UPDATE_ACCOUNT', PostMessages.UPDATE_ACCOUNT, 'account'],
      ['UPDATE_ACCOUNT_BALANCE', PostMessages.UPDATE_ACCOUNT_BALANCE, '123'],
      ['UPDATE_NETWORK', PostMessages.UPDATE_NETWORK, 4],
      ['UPDATE_LOCKS', PostMessages.UPDATE_LOCKS, locks],
    ])(
      'should emit PostMessages.%s upon receiving it',
      (_, message, payload) => {
        expect.assertions(1)

        const emitter = makeEmitter(fakeWindow)
        const receive: (p: typeof payload) => void = jest.fn()

        emitter.on(message, receive)

        fakeWindow.receivePostMessageFromIframe(
          message,
          payload,
          emitter.iframe,
          dataOrigin
        )

        expect(receive).toHaveBeenCalledWith(payload)
      }
    )
  })

  describe('validateWeb3MethodCall', () => {
    type FailureStuff = [string, any][]
    it.each(<FailureStuff>[
      ['not an object: number', 5],
      ['not an object: string', 'hi'],
      ['not an object: array', ['hi']],
      ['object missing method', {}],
      ['object, method is a number', { method: 5 }],
      ['object, method is an array', { method: [] }],
      ['object, method is an object', { method: {} }],
      ['object, params is a number', { method: 'eth_call', params: 5 }],
      ['object, params is a string', { method: 'eth_call', params: 'hi' }],
      ['object, params is an object', { method: 'eth_call', params: {} }],
      ['object, id is a string', { method: 'eth_call', params: [], id: 'hi' }],
      ['object, id is an array', { method: 'eth_call', params: [], id: [] }],
      ['object, id is an object', { method: 'eth_call', params: [], id: {} }],
      [
        'object, id is not an integer',
        { method: 'eth_call', params: [], id: 4.5 },
      ],
    ])('should return false with invalid method call, %s', (_, methodCall) => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)
      expect(emitter.validateWeb3MethodCall(methodCall)).toBe(false)
    })

    it('should return true on valid method call', () => {
      expect.assertions(1)

      const methodCall: web3MethodCall = {
        id: 123,
        jsonrpc: '2.0',
        method: 'some_function',
        params: [1, '2'],
      }

      const emitter = makeEmitter(fakeWindow)
      expect(emitter.validateWeb3MethodCall(methodCall)).toBe(true)
    })
  })

  describe('PostMessages.WEB3 validation', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should not emit a web3 method request that is invalid', () => {
      expect.assertions(1)

      const invalidMethodCall = {
        id: 'oops',
        jsonrpc: '2.0',
        method: 'some_function',
        params: [1, '2'],
      }
      const checker = jest.fn()

      const emitter = makeEmitter(fakeWindow)
      emitter.on(PostMessages.WEB3, checker)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.WEB3,
        (invalidMethodCall as unknown) as web3MethodCall,
        emitter.iframe,
        dataOrigin
      )

      expect(checker).not.toHaveBeenCalled()
    })
  })

  describe('PostMessages.UPDATE_LOCKS validation', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should not emit a locks update that is empty', () => {
      expect.assertions(1)

      const locks = {}
      const checker = jest.fn()

      const emitter = makeEmitter(fakeWindow)
      emitter.on(PostMessages.UPDATE_LOCKS, checker)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.UPDATE_LOCKS,
        locks,
        emitter.iframe,
        dataOrigin
      )

      expect(checker).not.toHaveBeenCalled()
    })
  })
})
