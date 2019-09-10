import {
  setupPostOffice,
  iframePostOffice,
  mainWindowPostOffice,
  PostOfficeWindow,
  PostMessageTarget,
  PostMessageListener,
  IframePostOfficeWindow,
  Iframe,
} from '../../utils/postOffice'
import { PostMessages } from '../../messageTypes'

describe('postOffice', () => {
  const fakeResponder = () => {}
  describe('setupPostOffice', () => {
    let fakeWindow: PostOfficeWindow
    let fakeTarget: PostMessageTarget
    let handlers: { [key: string]: PostMessageListener }

    beforeEach(() => {
      handlers = {}
      fakeWindow = {
        addEventListener(type, handler) {
          handlers[type] = handler
        },
      }
      fakeTarget = {
        postMessage: jest.fn(),
      }
    })

    it('throws if targetOrigin is not specified', () => {
      expect.assertions(1)

      expect(() => {
        setupPostOffice(fakeWindow, fakeTarget, '', '', '')
      }).toThrow('cannot safely postMessage without knowing the target origin')
    })

    it('throws if target is not specified', () => {
      expect.assertions(1)

      expect(() => {
        setupPostOffice(
          fakeWindow,
          (undefined as unknown) as PostMessageTarget,
          'hi',
          '',
          ''
        )
      }).toThrow('cannot safely postMessage without knowing the target origin')
    })

    it('adds a message event listener', () => {
      expect.assertions(1)

      setupPostOffice(fakeWindow, fakeTarget, 'hi', '', '')
      expect(handlers.message).toEqual(expect.any(Function))
    })

    it('returns a function that posts a message', () => {
      expect.assertions(2)

      const { postMessage } = setupPostOffice(
        fakeWindow,
        fakeTarget,
        'hi',
        '',
        ''
      )

      expect(postMessage).toBeInstanceOf(Function)
      postMessage(PostMessages.ACCOUNT, 'there')

      expect(fakeTarget.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: PostMessages.ACCOUNT,
          payload: 'there',
        }),
        'hi'
      )
    })

    it('should return a function that adds a handler', () => {
      expect.assertions(2)

      const listener = jest.fn()
      const { addHandler } = setupPostOffice(
        fakeWindow,
        fakeTarget,
        'http://fun.times',
        '',
        ''
      )

      expect(addHandler).toBeInstanceOf(Function)
      addHandler('hi', listener)

      handlers.message(
        {
          source: fakeTarget,
          origin: 'http://fun.times',
          data: {
            type: 'hi',
            payload: 'it worked!',
          },
        },
        fakeResponder
      )

      expect(listener).toHaveBeenCalledWith('it worked!', expect.any(Function))
    })

    describe('message listener', () => {
      beforeEach(() => {
        handlers = {}
        fakeWindow = {
          addEventListener(type, handler) {
            handlers[type] = handler
          },
        }
        fakeTarget = {
          postMessage: jest.fn(),
        }
      })

      it('bails if message is not from our target', () => {
        expect.assertions(2)

        const listener = jest.fn()
        const { addHandler } = setupPostOffice(
          fakeWindow,
          fakeTarget,
          'origin',
          '',
          ''
        )
        addHandler('hi', listener)

        handlers.message(
          {
            source: 'not from us',
            origin: 'origin',
            data: {
              type: 'hi',
              payload: 'hi again',
            },
          },
          fakeResponder
        )

        expect(listener).toHaveBeenCalledTimes(0)

        handlers.message(
          {
            source: fakeTarget,
            origin: 'not our origin',
            data: {
              type: 'hi',
              payload: 'hi again',
            },
          },
          fakeResponder
        )

        expect(listener).toHaveBeenCalledTimes(0)
      })

      it('bails if the message data is malformed', () => {
        expect.assertions(4)

        const listener = jest.fn()
        const { addHandler } = setupPostOffice(
          fakeWindow,
          fakeTarget,
          'origin',
          '',
          ''
        )
        addHandler('hi', listener)

        handlers.message(
          {
            source: fakeTarget,
            origin: 'origin',
          },
          fakeResponder
        )

        expect(listener).toHaveBeenCalledTimes(0)

        handlers.message(
          {
            source: fakeTarget,
            origin: 'origin',
            data: {},
          },
          fakeResponder
        )

        expect(listener).toHaveBeenCalledTimes(0)

        handlers.message(
          {
            source: fakeTarget,
            origin: 'origin',
            data: {
              type: 'oops',
            },
          },
          fakeResponder
        )

        expect(listener).toHaveBeenCalledTimes(0)

        handlers.message(
          {
            source: fakeTarget,
            origin: 'origin',
            data: {
              type: 1,
              payload: 'oops',
            },
          },
          fakeResponder
        )

        expect(listener).toHaveBeenCalledTimes(0)
      })

      it('calls the handler for the message type', () => {
        expect.assertions(1)

        const listener = jest.fn()
        const { addHandler } = setupPostOffice(
          fakeWindow,
          fakeTarget,
          'origin',
          '',
          ''
        )
        addHandler('hi', listener)

        handlers.message(
          {
            source: fakeTarget,
            origin: 'origin',
            data: {
              type: 'hi',
              payload: 'it worked!',
            },
          },
          fakeResponder
        )

        expect(listener).toHaveBeenCalledWith(
          'it worked!',
          expect.any(Function)
        )
      })

      it('does nothing if there is no handler for the type', () => {
        expect.assertions(1)

        const listener = jest.fn()
        const { addHandler } = setupPostOffice(
          fakeWindow,
          fakeTarget,
          'origin',
          '',
          ''
        )
        addHandler('hi', listener)

        handlers.message(
          {
            source: fakeTarget,
            origin: 'origin',
            data: {
              type: 'not hi',
              payload: 'it worked!',
            },
          },
          fakeResponder
        )

        expect(listener).not.toHaveBeenCalled()
      })

      describe('message handler', () => {
        interface JestMockListener extends PostMessageListener {
          mock: any
        }
        let listener: JestMockListener
        let addHandler: (type: string, listener: PostMessageListener) => void
        beforeEach(() => {
          listener = jest.fn()
          const info = setupPostOffice(fakeWindow, fakeTarget, 'origin', '', '')
          addHandler = info.addHandler
          addHandler('hi', listener)

          handlers.message(
            {
              source: fakeTarget,
              origin: 'origin',
              data: {
                type: 'hi',
                payload: 'it worked!',
              },
            },
            fakeResponder
          )
        })

        it('calls the handler with a response callback', () => {
          expect.assertions(1)

          const response = listener.mock.calls[0][1]

          response('type', 'response')

          expect(fakeTarget.postMessage).toHaveBeenCalledWith(
            { type: 'type', payload: 'response' },
            'origin'
          )
        })

        it('should call all handlers registered with addHandler for the message type', () => {
          expect.assertions(2)

          listener = jest.fn()
          const listener2 = jest.fn()

          addHandler('hi', listener)
          addHandler('hi', listener2)

          handlers.message(
            {
              source: fakeTarget,
              origin: 'origin',
              data: {
                type: 'hi',
                payload: 'it worked!',
              },
            },
            fakeResponder
          )

          expect(listener).toHaveBeenCalledWith(
            'it worked!',
            expect.any(Function)
          )
          expect(listener2).toHaveBeenCalledWith(
            'it worked!',
            expect.any(Function)
          )
        })
      })
    })
  })

  describe('iframePostOffice', () => {
    let fakeWindow: IframePostOfficeWindow
    let fakeTarget: PostMessageTarget
    let handlers: { [key: string]: PostMessageListener }

    beforeEach(() => {
      fakeTarget = {
        postMessage: jest.fn(),
      }
      handlers = {}

      fakeWindow = {
        parent: fakeTarget,
        location: {
          href: 'http://example.com?origin=http%3A%2F%2Ffun.times',
        },
        addEventListener(type, handler) {
          handlers[type] = handler
        },
        // These tests don't actually use localStorage, no need to
        // mock it properly
        localStorage: {} as any,
      }
    })

    it('calls setupPostOffice with the iframe params', () => {
      expect.assertions(1)

      const listener = jest.fn()
      const { addHandler } = iframePostOffice(fakeWindow, '', '')
      addHandler('hi', listener)

      handlers.message(
        {
          source: fakeTarget,
          origin: 'http://fun.times',
          data: {
            type: 'hi',
            payload: 'it worked!',
          },
        },
        fakeResponder
      )

      const response = listener.mock.calls[0][1]

      response('type', 'response')

      expect(fakeTarget.postMessage).toHaveBeenCalledWith(
        { type: 'type', payload: 'response' },
        'http://fun.times'
      )
    })

    it('returns a function that is used to post a message', () => {
      expect.assertions(1)

      const listener = jest.fn()
      const { addHandler, postMessage } = iframePostOffice(fakeWindow, '', '')
      addHandler('hi', listener)

      postMessage(PostMessages.ACCOUNT, 'response')

      expect(fakeTarget.postMessage).toHaveBeenCalledWith(
        { type: PostMessages.ACCOUNT, payload: 'response' },
        'http://fun.times'
      )
    })
  })

  describe('mainWindowPostOffice', () => {
    let fakeWindow: PostOfficeWindow
    let handlers: { [key: string]: PostMessageListener }
    let iframe: Iframe

    beforeEach(() => {
      iframe = {
        contentWindow: {
          postMessage: jest.fn(),
        },
      }

      handlers = {}
      fakeWindow = {
        addEventListener(type, handler) {
          handlers[type] = handler
        },
      }
    })

    it('calls setupPostOffice with the main window params', () => {
      expect.assertions(1)

      const listener = jest.fn()
      const { addHandler } = mainWindowPostOffice(
        fakeWindow,
        iframe,
        'http://fun.times',
        '',
        ''
      )
      addHandler('hi', listener)

      handlers.message(
        {
          source: iframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: 'hi',
            payload: 'it worked!',
          },
        },
        fakeResponder
      )

      const response = listener.mock.calls[0][1]

      response('type', 'response')

      expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
        { type: 'type', payload: 'response' },
        'http://fun.times'
      )
    })

    it('returns a function that is used to post a message', () => {
      expect.assertions(1)

      const listener = jest.fn()
      const { addHandler, postMessage } = mainWindowPostOffice(
        fakeWindow,
        iframe,
        'http://fun.times'
      )
      addHandler('hi', listener)

      postMessage(PostMessages.ACCOUNT, 'response')

      expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
        { type: PostMessages.ACCOUNT, payload: 'response' },
        'http://fun.times'
      )
    })
  })
})
