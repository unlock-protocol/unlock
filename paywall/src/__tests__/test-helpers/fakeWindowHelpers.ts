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
  PostOfficeEventTypes,
  MessageEvent,
  web3MethodResult,
} from '../../windowTypes'
import { ExtractPayload, PostMessages } from '../../messageTypes'

export default class FakeWindow
  implements FetchWindow, SetTimeoutWindow, IframePostOfficeWindow {
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
  public setTimeout: (cb: Function, delay?: number) => number
  public parent: PostMessageTarget
  public location: {
    href: string
  }
  public addEventListener: (
    type: PostOfficeEventTypes,
    handler: MessageHandler
  ) => void
  public listeners: { [key: string]: Map<MessageHandler, MessageHandler> } = {}

  constructor() {
    this.fetch = jest.fn((_: string) => {
      return Promise.resolve({
        json: () => Promise.resolve(this.fetchResult),
      })
    })
    this.setTimeout = jest.fn()
    this.location = {
      href: 'http://fun.times?origin=http%3a%2f%2fexample.com',
    }
    this.parent = {
      postMessage: jest.fn(),
    }
    this.addEventListener = jest.fn((type, handler) => {
      this.listeners[type] = this.listeners[type] || new Map()
      this.listeners[type].set(handler, handler)
    })
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
    this.listeners.message &&
      this.listeners.message.forEach(handler => handler(event))
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
