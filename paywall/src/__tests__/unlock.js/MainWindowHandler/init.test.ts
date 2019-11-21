import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'
import { PostMessages } from '../../../messageTypes'

describe('MainWindowHandler - init', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const accountIframeUrl = 'http://app/accounts'
  const config: PaywallConfig = {
    locks: {},
    callToAction: {
      default: '',
      pending: '',
      expired: '',
      confirmed: '',
      noWallet: '',
    },
  }

  function getMainWindowHandler(configuration = config) {
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      accountIframeUrl
    )
    // constants parameter not important for these tests
    return new MainWindowHandler(fakeWindow, iframes, configuration, {} as any)
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  describe('toggling lock state', () => {
    it('should handle PostMessages.LOCKED by emitting a locked event', () => {
      expect.assertions(1)

      getMainWindowHandler()

      iframes.data.emit(PostMessages.LOCKED)

      expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'locked',
        })
      )
    })

    it('should handle PostMessages.UNLOCKED by emitting an unlocked event', () => {
      expect.assertions(1)

      getMainWindowHandler()

      iframes.data.emit(PostMessages.UNLOCKED, [])
      expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'unlocked',
        })
      )
    })

    it('should handle PostMessages.ERROR for no crypto wallet by emitting a locked event', () => {
      expect.assertions(2)

      getMainWindowHandler()

      // This is the only error message we lock the page for
      iframes.data.emit(PostMessages.ERROR, 'no ethereum wallet is available')

      expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'locked',
        })
      )

      iframes.data.emit(
        PostMessages.ERROR,
        'angry bees have invaded the datacenter'
      )

      // We did not call it in response to the second error
      expect(fakeWindow.dispatchEvent).toHaveBeenCalledTimes(1)
    })
  })

  describe('iframe visibility', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should hide the checkout iframe on DISMISS_CHECKOUT message', () => {
      expect.assertions(1)

      const paywallConfig: PaywallConfig = {
        ...config,
      }

      getMainWindowHandler(paywallConfig)
      iframes.checkout.hideIframe = jest.fn()

      iframes.checkout.emit(PostMessages.DISMISS_CHECKOUT)

      expect(iframes.checkout.hideIframe).toHaveBeenCalled()
    })

    it('should show the accounts iframe on SHOW_ACCOUNTS_MODAL message', () => {
      expect.assertions(1)

      const paywallConfig: PaywallConfig = {
        ...config,
      }

      const handler = getMainWindowHandler(paywallConfig)
      handler.showAccountIframe = jest.fn()
      iframes.accounts.createIframe()
      iframes.accounts.showIframe = jest.fn()

      iframes.accounts.emit(PostMessages.SHOW_ACCOUNTS_MODAL)

      expect(iframes.accounts.showIframe).toHaveBeenCalled()
    })

    it('should hide the accounts iframe on HIDE_ACCOUNTS_MODAL message', () => {
      expect.assertions(1)

      const paywallConfig: PaywallConfig = {
        ...config,
      }

      const handler = getMainWindowHandler(paywallConfig)
      handler.showAccountIframe = jest.fn()
      iframes.accounts.createIframe()
      iframes.accounts.hideIframe = jest.fn()

      iframes.accounts.emit(PostMessages.HIDE_ACCOUNTS_MODAL)

      expect(iframes.accounts.hideIframe).toHaveBeenCalled()
    })
  })
})
