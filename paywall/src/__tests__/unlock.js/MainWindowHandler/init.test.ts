import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'
import { PostMessages } from '../../../messageTypes'

describe('MainWindowHandler - init', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const dataOrigin = 'http://paywall'
  const checkoutOrigin = 'http://paywall'
  const accountOrigin = 'http://app'
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const accountIframeUrl = 'http://app/account'
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
    iframes.init(configuration)
    return new MainWindowHandler(fakeWindow, iframes)
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  describe('toggling lock state', () => {
    it('should handle PostMessages.LOCKED by emitting a locked event', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.toggleLockState = jest.fn()
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.LOCKED,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )

      expect(handler.toggleLockState).toHaveBeenCalledWith(PostMessages.LOCKED)
    })

    it('should handle PostMessages.UNLOCKED by emitting an unlocked event', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.toggleLockState = jest.fn()
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.UNLOCKED,
        [],
        iframes.data.iframe,
        dataOrigin
      )

      expect(handler.toggleLockState).toHaveBeenCalledWith(
        PostMessages.UNLOCKED
      )
    })

    it('should handle PostMessages.ERROR for no crypto wallet by emitting a locked event', () => {
      expect.assertions(2)

      const handler = getMainWindowHandler()
      handler.toggleLockState = jest.fn()
      handler.init()

      // This is the only error message we lock the page for
      fakeWindow.receivePostMessageFromIframe(
        PostMessages.ERROR,
        'no ethereum wallet is available',
        iframes.data.iframe,
        dataOrigin
      )

      expect(handler.toggleLockState).toHaveBeenCalledWith(PostMessages.LOCKED)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.ERROR,
        'angry bees have invaded the datacenter',
        iframes.data.iframe,
        dataOrigin
      )

      // We did not call it in response to the second error
      expect(handler.toggleLockState).toHaveBeenCalledTimes(1)
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

      const handler = getMainWindowHandler(paywallConfig)
      handler.hideCheckoutIframe = jest.fn()
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.DISMISS_CHECKOUT,
        undefined,
        iframes.checkout.iframe,
        checkoutOrigin
      )

      expect(handler.hideCheckoutIframe).toHaveBeenCalled()
    })

    it('should show the accounts iframe on SHOW_ACCOUNTS_MODAL message', () => {
      expect.assertions(1)

      const paywallConfig: PaywallConfig = {
        ...config,
      }

      const handler = getMainWindowHandler(paywallConfig)
      handler.showAccountIframe = jest.fn()
      iframes.accounts.createIframe()
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.SHOW_ACCOUNTS_MODAL,
        undefined,
        iframes.accounts.iframe,
        accountOrigin
      )

      expect(handler.showAccountIframe).toHaveBeenCalled()
    })

    it('should hide the accounts iframe on HIDE_ACCOUNTS_MODAL message', () => {
      expect.assertions(1)

      const paywallConfig: PaywallConfig = {
        ...config,
      }

      const handler = getMainWindowHandler(paywallConfig)
      handler.hideAccountIframe = jest.fn()
      iframes.accounts.createIframe()
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.HIDE_ACCOUNTS_MODAL,
        undefined,
        iframes.accounts.iframe,
        accountOrigin
      )

      expect(handler.hideAccountIframe).toHaveBeenCalled()
    })
  })
})
