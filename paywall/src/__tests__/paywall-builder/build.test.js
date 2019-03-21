import buildPaywall, { redirect, scrollLoop } from '../../paywall-builder/build'
import * as script from '../../paywall-builder/script'
import * as iframeManager from '../../paywall-builder/iframe'
import {
  POST_MESSAGE_SCROLL_POSITION,
  POST_MESSAGE_LOCKED,
  POST_MESSAGE_UNLOCKED,
  POST_MESSAGE_REDIRECT,
} from '../../paywall-builder/constants'

global.window = {} // this is fun...
global.MutationObserver = function() {
  this.observe = () => {}
}

const fakeLockAddress = 'lockaddress'

describe('buildPaywall', () => {
  let document
  let eventListener
  function scrollThatPage(window) {
    window.pageYOffset += 20
  }

  function lockThatPage() {
    eventListener({ data: POST_MESSAGE_LOCKED })
  }

  beforeEach(() => {
    document = {
      documentElement: {
        scrollHeight: 22293,
      },
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
      encodeURIComponent: u => global.encodeURIComponent(u),
    }

    redirect(fakeWindow, 'hi/')

    expect(fakeWindow.location.href).toBe('hi/href%2F')
  })

  describe('sets up the iframe on load', () => {
    let mockScript
    let mockIframe
    let mockIframeImpl
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
        },
        style: {},
      }

      mockAdd = jest.spyOn(iframeManager, 'add')
      mockScript.mockImplementation(() => '/url')
      mockIframe.mockImplementation(() => mockIframeImpl)
      mockAdd.mockImplementation(() => {})
      window = {
        addEventListener(type, listener) {
          expect(type).toBe('message')
          expect(listener).not.toBe(null)
          eventListener = listener
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
        remove() {},
      }
    })

    it('no lockAddress, give up', () => {
      expect.assertions(1)
      buildPaywall(window, document)

      expect(mockScript).not.toHaveBeenCalled()
    })

    it('bails out on error', () => {
      expect.assertions(2)
      const blocker = {
        appendChild: jest.fn(),
      }
      mockIframe.mockImplementation(() => {
        throw new Error('thrown')
      })
      expect(() => {
        buildPaywall(window, document, '123', blocker)
      }).toThrow()
      expect(blocker.appendChild).toHaveBeenCalled()
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

    it('passes the correct origin to scrollLoop', () => {
      expect.assertions(4)

      scrollThatPage(window)

      buildPaywall(window, document, fakeLockAddress, blocker)
      lockThatPage()

      // new URL().origin
      expect(postMessage).toHaveBeenCalled()
      expect(postMessage.mock.calls[0][1]).toBe('origin')
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
      beforeEach(() => {
        callbacks = {}
        window = {
          addEventListener(type, listener) {
            callbacks[type] = listener
          },
          encodeURIComponent: u => global.encodeURIComponent(u),
          requestAnimationFrame: jest.fn(),
          innerHeight: 266,
          pageYOffset: 0, // change to "scroll"
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
          appendChild: jest.fn(),
        }
        mockShow = jest.spyOn(iframeManager, 'show')
        mockShow.mockImplementation(() => {})
        mockHide = jest.spyOn(iframeManager, 'hide')
        mockHide.mockImplementation(() => {})
        buildPaywall(window, document, fakeLockAddress, blocker)
      })

      it('bails out on error in locked event', () => {
        expect.assertions(2)
        mockShow.mockImplementation(() => {
          throw new Error('thrown')
        })
        expect(() => {
          callbacks.message({ data: POST_MESSAGE_LOCKED })
        }).toThrow()
        expect(blocker.appendChild).toHaveBeenCalled()
      })

      it('triggers show on locked event', () => {
        expect.assertions(2)
        callbacks.message({ data: POST_MESSAGE_LOCKED })

        expect(mockShow).toHaveBeenCalledWith(mockIframeImpl, document)
        expect(mockHide).not.toHaveBeenCalled()
      })

      it('closes the blocker on locked event', () => {
        expect.assertions(1)
        callbacks.message({ data: POST_MESSAGE_LOCKED })

        expect(blocker.remove).toHaveBeenCalled()
      })

      it('bails out on error in unlocked event', () => {
        expect.assertions(2)
        mockHide.mockImplementationOnce(() => {
          throw new Error('thrown')
        })
        expect(() => {
          callbacks.message({ data: POST_MESSAGE_LOCKED })
          callbacks.message({ data: POST_MESSAGE_UNLOCKED })
        }).toThrow()
        expect(blocker.appendChild).toHaveBeenCalled()
      })

      it('closes the blocker on unlocked event', () => {
        expect.assertions(1)
        callbacks.message({ data: POST_MESSAGE_LOCKED })
        callbacks.message({ data: POST_MESSAGE_UNLOCKED })

        expect(blocker.remove).toHaveBeenCalledTimes(2)
      })

      it('does not trigger show on locked event if already unlocked', () => {
        expect.assertions(2)
        callbacks.message({ data: POST_MESSAGE_LOCKED })
        callbacks.message({ data: POST_MESSAGE_LOCKED })

        expect(mockShow).toHaveBeenCalledTimes(1)
        expect(mockHide).not.toHaveBeenCalled()
      })

      it('triggers hide on unlock event', () => {
        expect.assertions(3)
        callbacks.message({ data: POST_MESSAGE_LOCKED })
        callbacks.message({ data: POST_MESSAGE_UNLOCKED })
        callbacks.message({ data: POST_MESSAGE_UNLOCKED })

        expect(mockHide).toHaveBeenCalledWith(mockIframeImpl, document)
        expect(mockHide).toHaveBeenCalledTimes(1)
        expect(mockShow).toHaveBeenCalledTimes(1)
      })

      it('bails out on error in redirect event', () => {
        expect.assertions(2)
        window.encodeURIComponent = () => {
          throw new Error('thrown')
        }
        expect(() => {
          callbacks.message({ data: POST_MESSAGE_REDIRECT })
        }).toThrow()
        expect(blocker.appendChild).toHaveBeenCalled()
      })

      it('calls redirect on redirect event', () => {
        expect.assertions(1)
        callbacks.message({ data: POST_MESSAGE_REDIRECT })

        expect(window.location.href).toBe('/url/lockaddress/href')
      })
    })
    describe('scrollLoop', () => {
      let iframe
      beforeEach(() => {
        mockScript = jest.spyOn(script, 'findPaywallUrl')
        mockIframe = jest.spyOn(iframeManager, 'getIframe')
        postMessage = jest.fn()
        iframe = {
          contentWindow: {
            postMessage,
          },
          style: {},
        }

        mockAdd = jest.spyOn(iframeManager, 'add')
        mockScript.mockImplementation(() => '/url')
        mockIframe.mockImplementation(() => iframe)
        mockAdd.mockImplementation(() => {})
        window = {
          addEventListener(type, listener) {
            eventListener = listener
          },
          requestAnimationFrame: jest.fn(),
          location: {
            hash: '',
          },
          innerHeight: 266,
          pageYOffset: 0, // change to "scroll"
          origin: 'origin/',
          URL: () => {
            return {
              origin: 'origin',
            }
          },
        }
        blocker = {
          remove() {},
        }
      })

      it('does not send scroll if the window is fully scrolled', () => {
        expect.assertions(1)

        buildPaywall(window, document, fakeLockAddress, blocker)
        lockThatPage()
        iframe.contentWindow.postMessage.mockClear()

        document.documentElement.scrollHeight = window.innerHeight
        scrollLoop(window, document, iframe, 'origin')

        expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
      })

      it('sends a scroll position if the window is scrolled', () => {
        expect.assertions(1)

        buildPaywall(window, document, fakeLockAddress, blocker)
        lockThatPage()
        iframe.contentWindow.postMessage.mockClear()

        scrollLoop(window, document, iframe, 'origin')

        expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
          {
            type: POST_MESSAGE_SCROLL_POSITION,
            payload: 140.97744360902254,
          },
          'origin'
        )
      })

      it('sends a weighted scroll position', () => {
        expect.assertions(2)

        buildPaywall(window, document, fakeLockAddress, blocker)
        lockThatPage()
        iframe.contentWindow.postMessage.mockClear()

        scrollLoop(window, document, iframe, 'origin')
        scrollThatPage(window) // scroll down 20 pixels
        scrollLoop(window, document, iframe, 'origin')

        expect(iframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
          1,
          {
            type: POST_MESSAGE_SCROLL_POSITION,
            payload: 140.97744360902254,
          },
          'origin'
        )

        expect(iframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
          2,
          {
            type: POST_MESSAGE_SCROLL_POSITION,
            payload: 141.06824126644298,
          },
          'origin'
        )
      })

      it('requests a new animation frame for the next scroll check', () => {
        expect.assertions(1)

        buildPaywall(window, document, fakeLockAddress, blocker)
        lockThatPage()

        scrollLoop(window, document, iframe, 'origin')

        expect(window.requestAnimationFrame).toHaveBeenCalled()
      })

      it('calls scrollLoop in the requestAnimationFrame callback', () => {
        expect.assertions(2)

        buildPaywall(window, document, fakeLockAddress, blocker)
        lockThatPage()
        iframe.contentWindow.postMessage.mockClear()

        scrollLoop(window, document, iframe, 'origin')

        expect(window.requestAnimationFrame).toHaveBeenCalled()
        const scrollCb = window.requestAnimationFrame.mock.calls[0][0]

        scrollThatPage(window)
        scrollCb()

        expect(iframe.contentWindow.postMessage).toHaveBeenCalledTimes(2)
      })
    })
  })
})
