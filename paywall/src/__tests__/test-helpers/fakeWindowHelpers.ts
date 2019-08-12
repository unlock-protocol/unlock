import {
  FetchWindow,
  SetTimeoutWindow,
  LocksmithTransactionsResult,
  FetchResult,
} from '../../data-iframe/blockchainHandler/blockChainTypes'
import {
  IframePostOfficeWindow,
  PostMessageTarget,
  MessageHandler,
  MessageEvent,
  web3MethodResult,
  ConsoleWindow,
  LocalStorageWindow,
  AddEventListenerFunc,
  StorageHandler,
  StorageEvent,
  OriginWindow,
  IframeManagingWindow,
  IframeType,
  IframeAttributeNames,
  EventWindow,
  FullDocument,
  UnlockWindowNoProtocolYet,
} from '../../windowTypes'
import { ExtractPayload, PostMessages } from '../../messageTypes'
import { waitFor } from '../../utils/promises'

export default class FakeWindow
  implements
    FetchWindow,
    SetTimeoutWindow,
    IframePostOfficeWindow,
    UnlockWindowNoProtocolYet,
    IframeManagingWindow,
    ConsoleWindow,
    LocalStorageWindow,
    OriginWindow,
    EventWindow {
  public origin = 'http://example.com'
  public fetchResult: any = {}
  public fetch: (
    url: string,
    options?: {
      method: 'POST'
      mode: 'cors'
      headers: {
        'Content-Type': 'application/json'
      }
      body: string
    }
  ) => Promise<FetchResult>
  public setInterval: (cb: Function, delay?: number) => number
  public setTimeout: (cb: Function, delay?: number) => number
  public parent: PostMessageTarget
  public location: {
    href: string
  }
  public addEventListener: AddEventListenerFunc
  public messageListeners: {
    [key: string]: Map<MessageHandler, MessageHandler>
  } = {}
  public storageListeners: {
    [key: string]: Map<StorageHandler, StorageHandler>
  } = {}
  public console: Pick<ConsoleWindow, 'console'>['console']
  public localStorage: Pick<LocalStorageWindow, 'localStorage'>['localStorage']
  public storage: { [key: string]: string } = {}
  public document: FullDocument
  public CustomEvent = CustomEvent
  public Promise = Promise
  public dispatchEvent: (event: Event) => void

  constructor() {
    this.fetch = jest.fn((_: string) => {
      return Promise.resolve({
        json: () => Promise.resolve(this.fetchResult),
      })
    })
    this.setTimeout = jest.fn()
    this.setInterval = jest.fn()
    this.location = {
      href: 'http://fun.times?origin=http%3a%2f%2fexample.com',
    }
    this.document = {
      createElement: (_: 'iframe') => {
        const iframe: IframeType = {
          src: '',
          name: '',
          className: '',
          setAttribute: (attr: IframeAttributeNames, value: string) => {
            iframe[attr] = value
          },
          contentWindow: {
            postMessage: jest.fn(),
          },
        }
        return iframe
      },
      createEvent: (type: string) => {
        const event = new this.CustomEvent<any>(type)
        return event
      },
      querySelector: () => false,
      body: {
        insertAdjacentElement: jest.fn(),
        style: {
          overflow: '',
        },
      },
    }
    this.parent = {
      postMessage: jest.fn(),
    }
    this.addEventListener = jest.fn((type, handler) => {
      if (type === 'message') {
        this.messageListeners[type] =
          this.messageListeners[type] ||
          new Map<MessageHandler, MessageHandler>()
        this.messageListeners[type].set(
          handler as MessageHandler,
          handler as MessageHandler
        )
      }
      if (type === 'storage') {
        this.storageListeners[type] =
          this.storageListeners[type] ||
          new Map<StorageHandler, StorageHandler>()
        this.storageListeners[type].set(
          handler as StorageHandler,
          handler as StorageHandler
        )
      }
    })
    this.console = {
      log: jest.fn(),
      error: jest.fn(),
    }
    this.dispatchEvent = jest.fn()
    this.localStorage = {
      length: 0,
      clear: () => (this.storage = {}),
      getItem: (key: string) => this.storage[key] || null,
      setItem: (key: string, value: string) => (this.storage[key] = value),
      key: (index: number) => {
        return Object.keys(this.storage)[index]
      },
      removeItem: (key: string) => {
        delete this.storage[key]
      },
    }
  }

  public setupTransactionsResult(result: {
    transactions?: LocksmithTransactionsResult[]
  }) {
    this.fetchResult = result
  }

  public receivePostMessageFromMainWindow<
    T extends PostMessages = PostMessages
  >(type: T, payload: ExtractPayload<T>) {
    const event: MessageEvent = {
      origin: 'http://example.com',
      source: this.parent,
      data: {
        type,
        payload,
      },
    }
    this.messageListeners.message &&
      this.messageListeners.message.forEach(handler => handler(event))
  }

  public receivePostMessageFromIframe<T extends PostMessages = PostMessages>(
    type: T,
    payload: ExtractPayload<T>,
    iframe: IframeType,
    origin: string
  ) {
    const event: MessageEvent = {
      origin,
      source: iframe.contentWindow,
      data: {
        type,
        payload,
      },
    }
    this.messageListeners.message &&
      this.messageListeners.message.forEach(handler => handler(event))
  }

  public receiveStorageEvent(key: string, newValue: string, oldValue: string) {
    const event: StorageEvent = {
      key,
      oldValue,
      newValue,
      storageArea: this.localStorage,
    }
    this.storageListeners.storage &&
      this.storageListeners.storage.forEach(handler => handler(event))
  }

  public waitForPostMessage() {
    return waitFor(() => (this.parent as any).postMessage.mock.calls.length)
  }

  public clearPostMessageMock() {
    ;(this.parent as any).postMessage.mockClear()
  }

  public expectPostMessageSent<T extends PostMessages = PostMessages>(
    type: T,
    payload: ExtractPayload<T>
  ) {
    expect(this.parent.postMessage).toHaveBeenCalledWith(
      {
        type,
        payload,
      },
      'http://example.com' // origin passed in the URL as ?origin=<urlencoded origin>
    )
  }

  public expectPostMessageSentToIframe<T extends PostMessages = PostMessages>(
    type: T,
    payload: ExtractPayload<T>,
    iframe: IframeType,
    iframeOrigin: string
  ) {
    expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type,
        payload,
      },
      iframeOrigin
    )
  }

  public throwOnLocalStorageGet() {
    this.localStorage.getItem = () => {
      throw new Error('failed to get')
    }
  }

  public throwOnLocalStorageRemove() {
    this.localStorage.removeItem = () => {
      throw new Error('failed to get')
    }
  }

  public throwOnLocalStorageSet() {
    this.localStorage.setItem = () => {
      throw new Error('failed to set')
    }
  }

  public respondToWeb3(netversion: number, account: string | null) {
    const accountResponse = account ? [account] : []

    this.parent.postMessage = jest.fn(message => {
      const constructResult = (result: any): web3MethodResult => {
        return {
          id: message.payload.id,
          jsonrpc: '2.0',
          result: {
            id: message.payload.id,
            jsonrpc: '2.0',
            result,
          },
        }
      }

      if (message.type === PostMessages.WEB3) {
        switch (message.payload.method) {
          case 'eth_accounts':
            this.receivePostMessageFromMainWindow(
              PostMessages.WEB3_RESULT,
              constructResult(accountResponse)
            )
            break
          case 'net_version':
            this.receivePostMessageFromMainWindow(
              PostMessages.WEB3_RESULT,
              constructResult(netversion)
            )
            break
          default:
            throw new Error(`unhandled web3 call ${message.payload.method}`)
        }
      }
    })
  }
}
