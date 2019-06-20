import setupIframeMailbox, {
  MessageHandlerTemplates,
  IframeNames,
} from '../../unlock.js/setupIframeMailbox'
import { IframeType, PostOfficeWindow } from '../../windowTypes'
import { MessageEvent } from '../../utils/postOffice'
import { MessageTypes, PostMessages } from '../../messageTypes'

declare const process: {
  env: any
}

process.env.PAYWALL_URL = 'paywall'
process.env.UNLOCK_APP_URL = 'unlock-app'
describe('setupIframeMailbox', () => {
  let fakeCheckoutIframe: IframeType
  let fakeDataIframe: IframeType
  let fakeAccountIframe: IframeType
  let fakeWindow: PostOfficeWindow

  function setupIframes() {
    fakeWindow = {
      addEventListener: jest.fn(),
    }
    fakeCheckoutIframe = {
      src: 'checkout',
      className: '',
      contentWindow: {
        postMessage: jest.fn(),
      },
      setAttribute: jest.fn(),
    }
    fakeDataIframe = {
      src: 'data',
      className: '',
      contentWindow: {
        postMessage: jest.fn(),
      },
      setAttribute: jest.fn(),
    }
    fakeAccountIframe = {
      src: 'account',
      className: '',
      contentWindow: {
        postMessage: jest.fn(),
      },
      setAttribute: jest.fn(),
    }
  }

  function postToIframe(whichone: IframeNames, type: string, payload: any) {
    let iframe: IframeType = fakeAccountIframe
    let postMessageIndex = 2
    let origin = ''
    switch (whichone) {
      case 'account':
        iframe = fakeAccountIframe
        postMessageIndex = 2
        origin = process.env.UNLOCK_APP_URL
        break
      case 'checkout':
        iframe = fakeCheckoutIframe
        postMessageIndex = 1
        origin = process.env.PAYWALL_URL
        break
      case 'data':
        iframe = fakeDataIframe
        postMessageIndex = 0
        origin = process.env.PAYWALL_URL
        break
    }
    const mock: any = fakeWindow.addEventListener

    const postMessage = mock.mock.calls[postMessageIndex][1]
    const event: MessageEvent = {
      source: iframe.contentWindow,
      origin,
      data: { type, payload },
    }
    postMessage(event)
  }

  function postToCheckout(type: string, payload?: any) {
    postToIframe('checkout', type, payload)
  }

  function postToAccount(type: string, payload?: any) {
    postToIframe('account', type, payload)
  }

  function postToData(type: string, payload?: any) {
    postToIframe('data', type, payload)
  }
  beforeEach(() => {
    setupIframes()
  })

  it('should return a function used to create handlers from a map', () => {
    expect.assertions(1)

    const mapHandlers = setupIframeMailbox(
      fakeWindow,
      fakeCheckoutIframe,
      fakeDataIframe,
      fakeAccountIframe
    )

    expect(mapHandlers).toBeInstanceOf(Function)
  })

  describe('mapHandler', () => {
    beforeEach(() => {
      setupIframes()
    })

    it('should map all of the types to new postMessage handlers', () => {
      expect.assertions(4)

      const fakeMap: MessageHandlerTemplates<MessageTypes> = {
        [PostMessages.UNLOCKED]: (
          send: Function,
          dataIframe: IframeType,
          checkoutIframe: IframeType,
          accountIframe: IframeType
        ) => {
          expect(send).toBeInstanceOf(Function)
          expect(dataIframe).toBe(fakeDataIframe)
          expect(checkoutIframe).toBe(fakeCheckoutIframe)
          expect(accountIframe).toBe(fakeAccountIframe)
          return () => {}
        },
      }

      const mapHandlers = setupIframeMailbox(
        fakeWindow,
        fakeCheckoutIframe,
        fakeDataIframe,
        fakeAccountIframe
      )

      mapHandlers('data', fakeMap)
    })

    it('should create a handler that responds to posted messages from the data iframe', () => {
      expect.assertions(1)

      const fakeMap: MessageHandlerTemplates<MessageTypes> = {
        [PostMessages.UNLOCKED]: () => {
          return (payload: any) => {
            expect(payload).toBe('hi')
          }
        },
      }

      const mapHandlers = setupIframeMailbox(
        fakeWindow,
        fakeCheckoutIframe,
        fakeDataIframe,
        fakeAccountIframe
      )

      mapHandlers('data', fakeMap)

      postToData(PostMessages.UNLOCKED, 'hi')
    })

    it('should create a handler that responds to posted messages from the checkout iframe', () => {
      expect.assertions(1)

      const fakeMap: MessageHandlerTemplates<MessageTypes> = {
        [PostMessages.UNLOCKED]: () => {
          return (payload: any) => {
            expect(payload).toBe('hi')
          }
        },
      }

      const mapHandlers = setupIframeMailbox(
        fakeWindow,
        fakeCheckoutIframe,
        fakeDataIframe,
        fakeAccountIframe
      )

      mapHandlers('checkout', fakeMap)

      postToCheckout(PostMessages.UNLOCKED, 'hi')
    })

    it('should create a handler that responds to posted messages from the account iframe', () => {
      expect.assertions(1)

      const fakeMap: MessageHandlerTemplates<MessageTypes> = {
        [PostMessages.UNLOCKED]: () => {
          return (payload: any) => {
            expect(payload).toBe('hi')
          }
        },
      }

      const mapHandlers = setupIframeMailbox(
        fakeWindow,
        fakeCheckoutIframe,
        fakeDataIframe,
        fakeAccountIframe
      )

      mapHandlers('account', fakeMap)

      postToAccount(PostMessages.UNLOCKED, 'hi')
    })

    it('should send a postMessage to the data iframe when send is used', () => {
      expect.assertions(2)

      const fakeMap: MessageHandlerTemplates<MessageTypes> = {
        [PostMessages.UNLOCKED]: send => {
          return (payload: any) => {
            expect(payload).toBe('hi')
            send('data', PostMessages.SEND_UPDATES, 'account')
            expect(
              fakeDataIframe.contentWindow.postMessage
            ).toHaveBeenCalledWith(
              {
                type: PostMessages.SEND_UPDATES,
                payload: 'account',
              },
              'paywall'
            )
          }
        },
      }

      const mapHandlers = setupIframeMailbox(
        fakeWindow,
        fakeCheckoutIframe,
        fakeDataIframe,
        fakeAccountIframe
      )

      mapHandlers('account', fakeMap)

      postToAccount(PostMessages.UNLOCKED, 'hi')
    })

    it('should send a postMessage to the checkout iframe when send is used', () => {
      expect.assertions(2)

      const fakeMap: MessageHandlerTemplates<MessageTypes> = {
        [PostMessages.UNLOCKED]: send => {
          return (payload: any) => {
            expect(payload).toBe('hi')
            send('checkout', PostMessages.SEND_UPDATES, 'account')
            expect(
              fakeCheckoutIframe.contentWindow.postMessage
            ).toHaveBeenCalledWith(
              {
                type: PostMessages.SEND_UPDATES,
                payload: 'account',
              },
              'paywall'
            )
          }
        },
      }

      const mapHandlers = setupIframeMailbox(
        fakeWindow,
        fakeCheckoutIframe,
        fakeDataIframe,
        fakeAccountIframe
      )

      mapHandlers('account', fakeMap)

      postToAccount(PostMessages.UNLOCKED, 'hi')
    })

    it('should send a postMessage to the account iframe when send is used', () => {
      expect.assertions(2)

      const fakeMap: MessageHandlerTemplates<MessageTypes> = {
        [PostMessages.UNLOCKED]: send => {
          return (payload: any) => {
            expect(payload).toBe('hi')
            send('account', PostMessages.SEND_UPDATES, 'account')
            expect(
              fakeAccountIframe.contentWindow.postMessage
            ).toHaveBeenCalledWith(
              {
                type: PostMessages.SEND_UPDATES,
                payload: 'account',
              },
              'unlock-app'
            )
          }
        },
      }

      const mapHandlers = setupIframeMailbox(
        fakeWindow,
        fakeCheckoutIframe,
        fakeDataIframe,
        fakeAccountIframe
      )

      mapHandlers('account', fakeMap)

      postToAccount(PostMessages.UNLOCKED, 'hi')
    })
  })
})
