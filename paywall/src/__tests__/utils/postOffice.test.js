import {
  setupPostOffice,
  _clearHandlers,
  setHandler,
  iframePostOffice,
  mainWindowPostOffice,
} from '../../utils/postOffice'

describe('postOffice', () => {
  describe('setupPostOffice', () => {
    let fakeWindow
    let fakeTarget

    beforeEach(() => {
      fakeWindow = {
        handlers: {},
        addEventListener(type, handler) {
          fakeWindow.handlers[type] = handler
        },
      }
      fakeTarget = {
        postMessage: jest.fn(),
      }
    })

    it('throws if targetOrigin is not specified', () => {
      expect.assertions(1)

      expect(() => {
        setupPostOffice(fakeWindow, fakeTarget)
      }).toThrow('cannot safely postMessage without knowing the target origin')
    })

    it('throws if target is not specified', () => {
      expect.assertions(1)

      expect(() => {
        setupPostOffice(fakeWindow, undefined, 'hi')
      }).toThrow('cannot safely postMessage without knowing the target origin')
    })

    it('adds a message event listener', () => {
      expect.assertions(1)

      setupPostOffice(fakeWindow, fakeTarget, 'hi')
      expect(fakeWindow.handlers.message).toEqual(expect.any(Function))
    })

    it('returns a function that posts a message', () => {
      expect.assertions(2)

      const postMessage = setupPostOffice(fakeWindow, fakeTarget, 'hi')

      expect(postMessage).toBeInstanceOf(Function)
      postMessage('hi', 'there')

      expect(fakeTarget.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hi',
          payload: 'there',
        }),
        'hi'
      )
    })

    describe('message listener', () => {
      beforeEach(() => {
        fakeWindow = {
          handlers: {},
          addEventListener(type, handler) {
            fakeWindow.handlers[type] = handler
          },
        }
        fakeTarget = {
          postMessage: jest.fn(),
        }
        _clearHandlers()
      })

      it('bails if message is not from our target', () => {
        expect.assertions(2)

        const listener = jest.fn()
        setHandler('hi', listener)
        setupPostOffice(fakeWindow, fakeTarget, 'origin')

        fakeWindow.handlers.message({
          source: 'not from us',
          origin: 'origin',
          data: {
            type: 'hi',
            payload: 'hi again',
          },
        })

        expect(listener).toHaveBeenCalledTimes(0)

        fakeWindow.handlers.message({
          source: fakeTarget,
          origin: 'not our origin',
          data: {
            type: 'hi',
            payload: 'hi again',
          },
        })

        expect(listener).toHaveBeenCalledTimes(0)
      })

      it('bails if the message data is malformed', () => {
        expect.assertions(4)

        const listener = jest.fn()
        setHandler('hi', listener)
        setupPostOffice(fakeWindow, fakeTarget, 'origin')

        fakeWindow.handlers.message({
          source: fakeTarget,
          origin: 'origin',
        })

        expect(listener).toHaveBeenCalledTimes(0)

        fakeWindow.handlers.message({
          source: fakeTarget,
          origin: 'origin',
          data: {},
        })

        expect(listener).toHaveBeenCalledTimes(0)

        fakeWindow.handlers.message({
          source: fakeTarget,
          origin: 'origin',
          data: {
            type: 'oops',
          },
        })

        expect(listener).toHaveBeenCalledTimes(0)

        fakeWindow.handlers.message({
          source: fakeTarget,
          origin: 'origin',
          data: {
            type: 1,
            payload: 'oops',
          },
        })

        expect(listener).toHaveBeenCalledTimes(0)
      })

      it('calls the handler for the message type', () => {
        expect.assertions(1)

        const listener = jest.fn()
        setHandler('hi', listener)
        setupPostOffice(fakeWindow, fakeTarget, 'origin')

        fakeWindow.handlers.message({
          source: fakeTarget,
          origin: 'origin',
          data: {
            type: 'hi',
            payload: 'it worked!',
          },
        })

        expect(listener).toHaveBeenCalledWith(
          'it worked!',
          expect.any(Function)
        )
      })

      it('does nothing if there is no handler for the type', () => {
        expect.assertions(1)

        const listener = jest.fn()
        setHandler('hi', listener)
        setupPostOffice(fakeWindow, fakeTarget, 'origin')

        fakeWindow.handlers.message({
          source: fakeTarget,
          origin: 'origin',
          data: {
            type: 'not hi',
            payload: 'it worked!',
          },
        })

        expect(listener).not.toHaveBeenCalled()
      })

      describe('message handler', () => {
        let listener
        beforeEach(() => {
          _clearHandlers()
          listener = jest.fn()
          setHandler('hi', listener)
          setupPostOffice(fakeWindow, fakeTarget, 'origin')

          fakeWindow.handlers.message({
            source: fakeTarget,
            origin: 'origin',
            data: {
              type: 'hi',
              payload: 'it worked!',
            },
          })
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

        it('chains handlers', () => {
          expect.assertions(2)

          listener = jest.fn()
          const listener2 = jest.fn()
          _clearHandlers()

          setHandler('hi', listener)
          setHandler('hi', listener2)

          fakeWindow.handlers.message({
            source: fakeTarget,
            origin: 'origin',
            data: {
              type: 'hi',
              payload: 'it worked!',
            },
          })

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
    let fakeWindow
    let fakeTarget

    beforeEach(() => {
      fakeTarget = {
        postMessage: jest.fn(),
      }

      fakeWindow = {
        parent: fakeTarget,
        location: {
          href: 'http://example.com?origin=http%3A%2F%2Ffun.times',
        },
        handlers: {},
        addEventListener(type, handler) {
          fakeWindow.handlers[type] = handler
        },
      }
      _clearHandlers()
    })

    it('calls setupPostOffice with the iframe params', () => {
      expect.assertions(1)

      const listener = jest.fn()
      setHandler('hi', listener)

      iframePostOffice(fakeWindow)

      fakeWindow.handlers.message({
        source: fakeTarget,
        origin: 'http://fun.times',
        data: {
          type: 'hi',
          payload: 'it worked!',
        },
      })

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
      setHandler('hi', listener)

      const postMessage = iframePostOffice(fakeWindow)

      postMessage('type', 'response')

      expect(fakeTarget.postMessage).toHaveBeenCalledWith(
        { type: 'type', payload: 'response' },
        'http://fun.times'
      )
    })
  })

  describe('mainWindowPostOffice', () => {
    let fakeWindow
    let iframe

    beforeEach(() => {
      iframe = {
        contentWindow: {
          postMessage: jest.fn(),
        },
      }

      fakeWindow = {
        location: {
          href: 'http://example.com?origin=http%3A%2F%2Ffun.times',
        },
        handlers: {},
        addEventListener(type, handler) {
          fakeWindow.handlers[type] = handler
        },
      }
      _clearHandlers()
    })

    it('calls setupPostOffice with the main window params', () => {
      expect.assertions(1)

      const listener = jest.fn()
      setHandler('hi', listener)

      mainWindowPostOffice(fakeWindow, iframe, 'http://fun.times')

      fakeWindow.handlers.message({
        source: iframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: 'hi',
          payload: 'it worked!',
        },
      })

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
      setHandler('hi', listener)

      const postMessage = mainWindowPostOffice(
        fakeWindow,
        iframe,
        'http://fun.times'
      )

      postMessage('type', 'response')

      expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
        { type: 'type', payload: 'response' },
        'http://fun.times'
      )
    })
  })
})
