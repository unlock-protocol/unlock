import buildPaywall, { redirect } from '../../../paywall-builder/build'
import * as script from '../../../paywall-builder/script'
import * as iframeManager from '../../../paywall-builder/iframe'

global.window = {} // this is fun...
global.MutationObserver = function() {
  this.observe = () => {}
}

const fakeLockAddress = 'lockaddress'

describe('buildPaywall', () => {
  let document

  beforeEach(() => {
    document = {
      documentElement: {
        scrollHeight: 0,
      },
    }
  })

  afterEach(() => jest.restoreAllMocks())

  it('redirect', () => {
    expect.assertions(1)
    const fakeWindow = {
      location: {
        href: 'href/',
      },
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
    beforeEach(() => {
      mockScript = jest.spyOn(script, 'findPaywallUrl')
      mockIframe = jest.spyOn(iframeManager, 'getIframe')
      mockIframeImpl = {
        contentWindow: {
          postMessage: () => {},
        },
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
        requestAnimationFrame() {},
        location: {
          hash: '',
        },
      }
    })

    it('no lockAddress, give up', () => {
      expect.assertions(1)
      buildPaywall(window, document)

      expect(mockScript).not.toHaveBeenCalled()
    })

    it('sets up the iframe with correct url', () => {
      expect.assertions(4) // 2 are in the addEventListener in the mock window (see beforeEach)
      buildPaywall(window, document, fakeLockAddress)

      expect(mockScript).toHaveBeenCalledWith(document)
      expect(mockIframe).toHaveBeenCalledWith(document, '/url/lockaddress/')
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
        '/url/lockaddress/#hithere'
      )
    })

    it('adds the iframe to the page', () => {
      expect.assertions(3) // 2 are in the addEventListener in the mock window (see beforeEach)
      buildPaywall(window, document, fakeLockAddress)

      expect(mockAdd).toHaveBeenCalledWith(document, mockIframeImpl)
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
      let mockShow
      let mockHide
      let blocker
      beforeEach(() => {
        callbacks = {}
        window = {
          addEventListener(type, listener) {
            callbacks[type] = listener
          },
          requestAnimationFrame() {},
          location: {
            href: 'href',
            hash: '',
          },
        }
        blocker = {
          remove: jest.fn(),
        }
        mockShow = jest.spyOn(iframeManager, 'show')
        mockShow.mockImplementation(() => {})
        mockHide = jest.spyOn(iframeManager, 'hide')
        mockHide.mockImplementation(() => {})
        buildPaywall(window, document, fakeLockAddress, blocker)
      })
      it('triggers show on locked event', () => {
        expect.assertions(2)
        callbacks.message({ data: 'locked' })

        expect(mockShow).toHaveBeenCalledWith(mockIframeImpl, document)
        expect(mockHide).not.toHaveBeenCalled()
      })
      it('closes the blocker on locked event', () => {
        expect.assertions(1)
        callbacks.message({ data: 'locked' })

        expect(blocker.remove).toHaveBeenCalled()
      })
      it('closes the blocker on unlocked event', () => {
        expect.assertions(1)
        callbacks.message({ data: 'locked' })
        callbacks.message({ data: 'unlocked' })

        expect(blocker.remove).toHaveBeenCalledTimes(2)
      })
      it('does not trigger show on locked event if already unlocked', () => {
        expect.assertions(2)
        callbacks.message({ data: 'locked' })
        callbacks.message({ data: 'locked' })

        expect(mockShow).toHaveBeenCalledTimes(1)
        expect(mockHide).not.toHaveBeenCalled()
      })
      it('triggers hide on unlock event', () => {
        expect.assertions(3)
        callbacks.message({ data: 'locked' })
        callbacks.message({ data: 'unlocked' })
        callbacks.message({ data: 'unlocked' })

        expect(mockHide).toHaveBeenCalledWith(mockIframeImpl, document)
        expect(mockHide).toHaveBeenCalledTimes(1)
        expect(mockShow).toHaveBeenCalledTimes(1)
      })
      it('calls redirect on redirect event', () => {
        expect.assertions(1)
        callbacks.message({ data: 'redirect' })

        expect(window.location.href).toBe('/url/lockaddress/href')
      })
    })
  })
})
