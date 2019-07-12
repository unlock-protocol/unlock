import { UnlockWindow, IframeType } from '../../windowTypes'
import { MessageTypes, ExtractPayload, PostMessages } from '../../messageTypes'
import setupIframeMailbox, {
  IframeNames,
  MessageHandlerTemplates,
} from '../../unlock.js/setupIframeMailbox'
import web3ProxyUserAccounts from '../../unlock.js/web3ProxyUserAccounts'

describe('web3ProxyUserAccounts', () => {
  let mapHandlers: (
    forIframe: IframeNames,
    handlers: MessageHandlerTemplates<MessageTypes>
  ) => void
  interface MockUnlockWindow extends UnlockWindow {
    handlers: {
      [key: string]: Function[]
    }
    storage: {
      [key: string]: string
    }
  }
  interface MockIframe extends IframeType {
    origin: string
    contentWindow: {
      Iam: string
      postMessage: (data: any, origin: string) => void
    }
  }
  let fakeWindow: MockUnlockWindow
  let fakeDataIframe: MockIframe
  let fakeCheckoutIframe: MockIframe
  let fakeAccountIframe: MockIframe

  function makeWeb3Proxy(account: string | null, network: number) {
    web3ProxyUserAccounts(mapHandlers, account, network)
  }

  function sendMessageFromIframe<T extends PostMessages = PostMessages>(
    source: MockIframe,
    type: T,
    payload?: ExtractPayload<T>
  ) {
    fakeWindow.handlers.message.forEach(handler =>
      handler({
        type: 'message',
        data: { type, payload },
        origin: source.origin,
        source: source.contentWindow,
      })
    )
  }

  function expectIframeReceived<T extends PostMessages = PostMessages>(
    iframe: MockIframe,
    type: T,
    payload?: ExtractPayload<T>
  ) {
    expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type,
        payload,
      },
      iframe.origin
    )
  }

  function makeFakeWindow() {
    fakeWindow = {
      Promise,
      setInterval: jest.fn(),
      unlockProtocol: {
        loadCheckoutModal: jest.fn(),
      },
      document: {
        createEvent: jest.fn(),
        createElement: jest.fn(),
        querySelector: jest.fn(),
        body: {
          insertAdjacentElement: jest.fn(),
          style: {
            overflow: '',
          },
        },
      },
      origin: 'http://fun.times',
      CustomEvent,
      dispatchEvent: jest.fn(),
      unlockProtocolConfig: {
        locks: {},
        callToAction: {
          default: 'hi',
          expired: '',
          pending: '',
          confirmed: '',
        },
      },
      handlers: {},
      addEventListener(type, handler) {
        fakeWindow.handlers[type] = fakeWindow.handlers[type] || []
        fakeWindow.handlers[type].push(handler)
      },
      storage: {},
      localStorage: {
        length: 1,
        clear: jest.fn(),
        key: jest.fn(),
        getItem: jest.fn(key => fakeWindow.storage[key]),
        setItem: jest.fn((key, value) => {
          if (typeof value !== 'string') {
            throw new Error('localStorage only supports strings')
          }
          fakeWindow.storage[key] = value
        }),
        removeItem: jest.fn(key => {
          delete fakeWindow.storage[key]
        }),
      },
    }
  }

  beforeEach(() => {
    process.env.PAYWALL_URL = 'http://paywall'
    process.env.USER_IFRAME_URL = 'http://unlock-app.com'
    const unlockOrigin = 'http://unlock-app.com'

    makeFakeWindow()
    fakeDataIframe = {
      className: '',
      setAttribute: jest.fn(),
      src: 'http://paywall/data',
      origin: 'http://paywall',
      contentWindow: {
        Iam: 'data',
        postMessage: jest.fn(),
      },
    }
    fakeCheckoutIframe = {
      className: 'unlock start',
      setAttribute: jest.fn(),
      src: 'http://paywall/checkout',
      origin: 'http://paywall',
      contentWindow: {
        Iam: 'UI',
        postMessage: jest.fn(),
      },
    }
    fakeAccountIframe = {
      className: 'unlock start',
      setAttribute: jest.fn(),
      src: 'http://unlock-app.com/account',
      origin: unlockOrigin,
      contentWindow: {
        Iam: 'account',
        postMessage: jest.fn(),
      },
    }
    mapHandlers = setupIframeMailbox(
      fakeWindow,
      fakeCheckoutIframe,
      fakeDataIframe,
      fakeAccountIframe
    )
  })

  it('should proxy transaction started information to the data iframe', () => {
    expect.assertions(1)

    makeWeb3Proxy('hi', 1)

    sendMessageFromIframe(fakeAccountIframe, PostMessages.INITIATED_TRANSACTION)
    expectIframeReceived(fakeDataIframe, PostMessages.INITIATED_TRANSACTION)
  })

  it('should return the proxy account in response to eth_accounts', () => {
    expect.assertions(1)

    makeWeb3Proxy('hi', 1)

    sendMessageFromIframe(fakeDataIframe, PostMessages.WEB3, {
      method: 'eth_accounts',
      params: [],
      jsonrpc: '2.0',
      id: 1,
    })
    expectIframeReceived(fakeDataIframe, PostMessages.WEB3_RESULT, {
      id: 1,
      error: null,
      result: {
        id: 1,
        jsonrpc: '2.0',
        result: ['hi'],
      },
    })
  })

  it('should return an updated account in response to eth_accounts after received account update', () => {
    expect.assertions(1)

    makeWeb3Proxy('hi', 1)

    sendMessageFromIframe(
      fakeAccountIframe,
      PostMessages.UPDATE_ACCOUNT,
      'new account'
    )
    sendMessageFromIframe(fakeDataIframe, PostMessages.WEB3, {
      method: 'eth_accounts',
      params: [],
      jsonrpc: '2.0',
      id: 2,
    })
    expectIframeReceived(fakeDataIframe, PostMessages.WEB3_RESULT, {
      id: 2,
      error: null,
      result: {
        id: 2,
        jsonrpc: '2.0',
        result: ['new account'],
      },
    })
  })

  it('should return the proxy network in response to net_version', () => {
    expect.assertions(1)

    makeWeb3Proxy('hi', 12)

    sendMessageFromIframe(fakeDataIframe, PostMessages.WEB3, {
      method: 'net_version',
      params: [],
      jsonrpc: '2.0',
      id: 1,
    })
    expectIframeReceived(fakeDataIframe, PostMessages.WEB3_RESULT, {
      id: 1,
      error: null,
      result: {
        id: 1,
        jsonrpc: '2.0',
        result: 12,
      },
    })
  })

  it('should proxy purchase key request to the account iframe', () => {
    expect.assertions(1)

    makeWeb3Proxy('hi', 1)

    const purchaseRequest = {
      lock: 'lock',
      extraTip: '0',
    }
    sendMessageFromIframe(
      fakeCheckoutIframe,
      PostMessages.PURCHASE_KEY,
      purchaseRequest
    )
    expectIframeReceived(
      fakeAccountIframe,
      PostMessages.PURCHASE_KEY,
      purchaseRequest
    )
  })
})
