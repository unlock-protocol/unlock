import buildPaywall from '../../paywall-builder/build'
import * as script from '../../paywall-builder/script'
import * as iframeManager from '../../paywall-builder/iframe'

global.window = {} // this is fun...
global.MutationObserver = function() {
  this.observe = () => {}
}

const fakeLockAddress = 'lockaddress'

describe('buildPaywall', () => {
  let document

  beforeEach(() => {
    document = {}
  })

  afterEach(() => jest.restoreAllMocks())

  describe('sets up the iframe on load', () => {
    let mockScript
    let mockIframe
    let mockAdd
    let window
    beforeEach(() => {
      mockScript = jest.spyOn(script, 'findPaywallUrl')
      mockIframe = jest.spyOn(iframeManager, 'getIframe')
      mockAdd = jest.spyOn(iframeManager, 'add')
      mockScript.mockImplementation(() => '/url')
      mockIframe.mockImplementation(() => 'iframe')
      mockAdd.mockImplementation(() => {})
      window = {
        addEventListener(type, listener) {
          expect(type).toBe('message')
          expect(listener).not.toBe(null)
        },
      }
    })
    it('no lockAddress, give up', () => {
      buildPaywall(window, document)

      expect(mockScript).not.toHaveBeenCalled()
    })

    it('sets up the iframe with correct url', () => {
      buildPaywall(window, document, fakeLockAddress)

      expect(mockScript).toHaveBeenCalledWith(document)
      expect(mockIframe).toHaveBeenCalledWith(
        document,
        '/url/paywall/lockaddress/'
      )
    })

    it('adds the iframe to the page', () => {
      buildPaywall(window, document, fakeLockAddress)

      expect(mockAdd).toHaveBeenCalledWith(document, 'iframe')
    })

    it('sets up the message event listeners', () => {
      jest.spyOn(window, 'addEventListener')
      buildPaywall(window, document, fakeLockAddress)

      expect(window.addEventListener).toHaveBeenCalled()
    })
    describe('event listeners', () => {
      let window
      let callbacks
      let mockShow
      let mockHide
      beforeEach(() => {
        callbacks = {}
        window = {
          addEventListener(type, listener) {
            callbacks[type] = listener
          },
        }
        mockShow = jest.spyOn(iframeManager, 'show')
        mockShow.mockImplementation(() => {})
        mockHide = jest.spyOn(iframeManager, 'hide')
        mockHide.mockImplementation(() => {})
        buildPaywall(window, document, fakeLockAddress)
      })
      it('triggers show on locked event', () => {
        callbacks.message({ data: 'locked' })

        expect(mockShow).toHaveBeenCalledWith('iframe', document)
        expect(mockHide).not.toHaveBeenCalled()
      })
      it('does not trigger show on locked event if already unlocked', () => {
        callbacks.message({ data: 'locked' })
        callbacks.message({ data: 'locked' })

        expect(mockShow).toHaveBeenCalledTimes(1)
        expect(mockHide).not.toHaveBeenCalled()
      })
      it('triggers hide on unlock event', () => {
        callbacks.message({ data: 'locked' })
        callbacks.message({ data: 'unlocked' })
        callbacks.message({ data: 'unlocked' })

<<<<<<< HEAD
        expect(mockHide).toHaveBeenCalledWith('iframe')
        expect(mockHide).toHaveBeenCalledTimes(1)
        expect(mockShow).toHaveBeenCalledTimes(1)
=======
        expect(mockHide).toHaveBeenCalledWith('iframe', document)
        expect(mockShow).not.toHaveBeenCalled()
>>>>>>> disable scroll when paywall is active
      })
    })
  })
})
