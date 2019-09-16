import buildPaywall, { redirect } from '../../paywall-builder/build'
import * as script from '../../paywall-builder/script'
import * as config from '../../paywall-builder/config'
import * as iframeManager from '../../paywall-builder/iframe'
import { PostMessages } from '../../messageTypes'

jest.mock('../../paywall-builder/config')

const fakeLockAddress = 'lockaddress'

describe('buildPaywall', () => {
  let document
  let mockIframeImpl

  beforeEach(() => {
    document = {
      documentElement: {},
      body: {
        style: {},
      },
      createElement: jest.fn(() => ({
        style: {},
      })),
    }
  })

  afterEach(() => jest.restoreAllMocks())

  it('redirect', () => {
    expect.assertions(1)
    const fakeWindow = {
      location: {
        href: 'href/',
      },
      // needed because we use encodeURIComponent to trigger a fake error when testing the
      // paywall's resilience to unexpected errors
      encodeURIComponent: u => global.encodeURIComponent(u),
    }

    redirect(fakeWindow, 'hi/')

    expect(fakeWindow.location.href).toBe('hi/href%2F')
  })

  describe('sets up the iframe on load', () => {
    let mockScript
    let mockIframe
    let mockAdd
    let window
    let postMessage
    let blocker
    let mockShow
    let mockHide
    beforeEach(() => {
      mockScript = jest.spyOn(script, 'findPaywallUrl')
      mockIframe = jest.spyOn(iframeManager, 'getIframe')
      postMessage = jest.fn()
      mockIframeImpl = {
        contentWindow: {
          postMessage,
          origin: 'origin',
        },
        style: {},
        remove: jest.fn(),
        setAttribute: jest.fn(),
      }

      mockAdd = jest.spyOn(iframeManager, 'add')
      mockScript.mockImplementation(() => '/url')
      mockIframe.mockImplementation(() => mockIframeImpl)
      mockAdd.mockImplementation(() => {})
      window = {
        addEventListener(type, listener) {
          expect(type).toBe('message')
          expect(listener).not.toBe(null)
        },
        requestAnimationFrame: () => {},
        location: {
          hash: '',
        },
        origin: 'origin/',
        URL: () => {
          return {
            origin: 'origin',
          }
        },
      }
      blocker = {
        remove: jest.fn(),
      }
    })

    it('no lockAddress, give up', () => {
      expect.assertions(1)
      buildPaywall(window, document)

      expect(mockScript).not.toHaveBeenCalled()
    })

    it('bails out on error', () => {
      expect.assertions(2)
      window.URL = () => {
        throw new Error('kill')
      }
      expect(() => {
        buildPaywall(window, document, '123', blocker)
      }).toThrow()
      expect(blocker.remove).toHaveBeenCalled()
    })

    it('sets up the iframe with correct url', () => {
      expect.assertions(4) // 2 are in the addEventListener in the mock window (see beforeEach)
      buildPaywall(window, document, fakeLockAddress)

      expect(mockScript).toHaveBeenCalledWith(document)
      expect(mockIframe).toHaveBeenCalledWith(
        document,
        '/url/lockaddress/?origin=origin%2F'
      )
    })

    it('passes the hash to the iframe, if present', () => {
      expect.assertions(4) // 2 are in the addEventListener in the mock window (see beforeEach)
      // when the content is loaded from the paywall in a new window,
      // it appends the user account as a hash. This is then passed on
      // as-is. Note that it passes any hash on, without validation,
      // because the lockRoute function properly validates the incoming hash
      window.location.hash = '#hithere'
      buildPaywall(window, document, fakeLockAddress)

      expect(mockScript).toHaveBeenCalledWith(document)
      expect(mockIframe).toHaveBeenCalledWith(
        document,
        '/url/lockaddress/?origin=origin%2F#hithere'
      )
    })

    it('adds the iframe to the page', () => {
      expect.assertions(3) // 2 are in the addEventListener in the mock window (see beforeEach)
      buildPaywall(window, document, fakeLockAddress)

      expect(mockAdd).toHaveBeenCalledWith(document, mockIframeImpl)
    })

    it('adds the iframe to the page over and over again', () => {
      expect.assertions(4) // 2 are in the addEventListener in the mock window (see beforeEach)
      jest.useFakeTimers()
      buildPaywall(window, document, fakeLockAddress)
      expect(setInterval).toHaveBeenCalledTimes(1)
      jest.advanceTimersByTime(500)
      expect(mockAdd).toHaveBeenCalledTimes(2)
    })

    it('calls setupReadyListener', () => {
      expect.assertions(3) // 2 are in the addEventListener in the mock window (see beforeEach)

      buildPaywall(window, document, fakeLockAddress, blocker)

      expect(config.setupReadyListener).toHaveBeenCalledWith(
        window,
        expect.objectContaining(mockIframeImpl),
        'origin'
      )
    })

    it('sets up the message event listeners', () => {
      expect.assertions(3) // 2 are in the addEventListener in the mock window (see beforeEach)
      jest.spyOn(window, 'addEventListener')
      buildPaywall(window, document, fakeLockAddress)

      expect(window.addEventListener).toHaveBeenCalled()
    })

    describe('event listeners', () => {
      let window
      let callbacks
      let iframe
      beforeEach(() => {
        callbacks = {}
        window = {
          addEventListener(type, listener) {
            callbacks[type] = listener
          },
          // needed in order to test the paywall's resilience to unexpected errors
          encodeURIComponent: u => global.encodeURIComponent(u),
          requestAnimationFrame: jest.fn(),
          innerHeight: 266,
          pageYOffset: 0,
          location: {
            href: 'href',
            hash: '',
          },
          URL: () => {
            return {
              origin: 'origin',
            }
          },
          origin: 'origin/',
        }
        blocker = {
          remove: jest.fn(),
        }
        mockShow = jest.spyOn(iframeManager, 'show')
        mockShow.mockImplementation(() => {})
        mockHide = jest.spyOn(iframeManager, 'hide')
        mockHide.mockImplementation(() => {})
        mockIframe = jest.spyOn(iframeManager, 'getIframe')
        iframe = {
          contentWindow: {
            postMessage,
            origin: 'origin',
          },
          style: {},
          remove: jest.fn(),
        }

        mockIframe.mockImplementation(() => iframe)
        buildPaywall(window, document, fakeLockAddress, blocker)
      })

      it('bails out on error in locked event', () => {
        expect.assertions(3)
        mockShow.mockImplementation(() => {
          throw new Error('thrown')
        })
        expect(() => {
          callbacks.message({
            data: PostMessages.LOCKED,
            origin: 'origin',
            source: iframe.contentWindow,
          })
        }).toThrow()
        expect(iframe.remove).toHaveBeenCalled()
        expect(blocker.remove).toHaveBeenCalled()
      })

      it('triggers show on locked event', () => {
        expect.assertions(2)
        callbacks.message({
          data: PostMessages.LOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })

        expect(mockShow).toHaveBeenCalledWith(iframe, document)
        expect(mockHide).not.toHaveBeenCalled()
      })

      it('closes the blocker on locked event', () => {
        expect.assertions(1)
        callbacks.message({
          data: PostMessages.LOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })

        expect(blocker.remove).toHaveBeenCalled()
      })

      it('bails out on error in unlocked event', () => {
        expect.assertions(3)
        mockHide.mockImplementationOnce(() => {
          throw new Error('thrown')
        })
        expect(() => {
          callbacks.message({
            data: PostMessages.LOCKED,
            origin: 'origin',
            source: iframe.contentWindow,
          })
          callbacks.message({
            data: PostMessages.UNLOCKED,
            origin: 'origin',
            source: iframe.contentWindow,
          })
        }).toThrow()
        expect(iframe.remove).toHaveBeenCalled()
        expect(blocker.remove).toHaveBeenCalled()
      })

      it('closes the blocker on unlocked event', () => {
        expect.assertions(1)
        callbacks.message({
          data: PostMessages.LOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })
        callbacks.message({
          data: PostMessages.UNLOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })

        expect(blocker.remove).toHaveBeenCalledTimes(2)
      })

      it('does not trigger show on locked event if already unlocked', () => {
        expect.assertions(2)
        callbacks.message({
          data: PostMessages.LOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })
        callbacks.message({
          data: PostMessages.LOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })

        expect(mockShow).toHaveBeenCalledTimes(1)
        expect(mockHide).not.toHaveBeenCalled()
      })

      it('triggers hide on unlock event', () => {
        expect.assertions(3)
        callbacks.message({
          data: PostMessages.LOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })
        callbacks.message({
          data: PostMessages.UNLOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })
        callbacks.message({
          data: PostMessages.UNLOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })

        expect(mockHide).toHaveBeenCalledWith(iframe, document)
        expect(mockHide).toHaveBeenCalledTimes(1)
        expect(mockShow).toHaveBeenCalledTimes(1)
      })

      it('calls hide on optimistic event', () => {
        expect.assertions(1)

        callbacks.message({
          data: PostMessages.LOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })
        callbacks.message({
          data: PostMessages.GET_OPTIMISTIC,
          origin: 'origin',
          source: iframe.contentWindow,
        })

        expect(mockHide).toHaveBeenLastCalledWith(iframe, document, false)
      })

      it('calls show on pessimistic event', () => {
        expect.assertions(1)

        callbacks.message({
          data: PostMessages.LOCKED,
          origin: 'origin',
          source: iframe.contentWindow,
        })
        callbacks.message({
          data: PostMessages.GET_PESSIMISTIC,
          origin: 'origin',
          source: iframe.contentWindow,
        })

        expect(mockShow).toHaveBeenLastCalledWith(iframe, document)
      })

      it('bails out on error in redirect event', () => {
        expect.assertions(3)
        window.encodeURIComponent = () => {
          throw new Error('thrown')
        }
        expect(() => {
          callbacks.message({
            data: PostMessages.REDIRECT,
            origin: 'origin',
            source: iframe.contentWindow,
          })
        }).toThrow()
        expect(iframe.remove).toHaveBeenCalled()
        expect(blocker.remove).toHaveBeenCalled()
      })

      it('calls redirect on redirect event', () => {
        expect.assertions(1)
        callbacks.message({
          data: PostMessages.REDIRECT,
          origin: 'origin',
          source: iframe.contentWindow,
        })

        expect(window.location.href).toBe('/url/lockaddress/href')
      })
    })
  })
})
