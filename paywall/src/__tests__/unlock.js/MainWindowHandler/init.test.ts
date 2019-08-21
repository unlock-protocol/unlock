import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'
import { PostMessages } from '../../../messageTypes'
import { UnlockWindow } from '../../../windowTypes'

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

  function fullWindow() {
    return (fakeWindow as unknown) as UnlockWindow
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  it('should call setupUnlockProtocolVariable before getting cache', () => {
    expect.assertions(2)

    const handler = getMainWindowHandler()
    handler.setupUnlockProtocolVariable = () => {
      throw new Error('abort')
    }
    handler.getCachedLockState = jest.fn()

    expect(() => handler.init()).toThrow()
    expect(handler.getCachedLockState).not.toHaveBeenCalled()
  })

  describe('cache', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should dispatch "locked" if the cached state is true', () => {
      expect.assertions(2)

      const handler = getMainWindowHandler()
      fakeWindow.storage['__unlockProtocol.locked'] = 'true'

      handler.init()
      const eventDetail = (fakeWindow.dispatchEvent as any).mock.calls[0][0]
        .detail

      expect(fakeWindow.dispatchEvent).toHaveBeenCalled()
      expect(eventDetail).toBe('locked')
    })

    it('should dispatch "unlocked" if the cached state is false', () => {
      expect.assertions(2)

      const handler = getMainWindowHandler()
      fakeWindow.storage['__unlockProtocol.locked'] = 'false'

      handler.init()
      const eventDetail = (fakeWindow.dispatchEvent as any).mock.calls[0][0]
        .detail

      expect(fakeWindow.dispatchEvent).toHaveBeenCalled()
      expect(eventDetail).toBe('unlocked')
    })

    it('should return default locked state as "undefined"', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.init()

      expect(fullWindow().unlockProtocol.getState()).toBeUndefined()
    })

    it('should set locked state for react apps', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.LOCKED,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )

      expect(fullWindow().unlockProtocol.getState()).toBe('locked')
    })

    it('should cache locked state', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.LOCKED,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )

      expect(handler.getCachedLockState()).toBe(true)
    })

    it('should dispatch unlockProtocol event, locked', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.init()
      handler.dispatchEvent = jest.fn()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.LOCKED,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )

      expect(handler.dispatchEvent).toHaveBeenCalledWith('locked')
    })

    it('should set unlocked state for react apps', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.UNLOCKED,
        ['address'],
        iframes.data.iframe,
        dataOrigin
      )

      expect(fullWindow().unlockProtocol.getState()).toBe('unlocked')
    })

    it('should cache unlocked state', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.init()

      const unlockedLockAddresses = ['address']
      fakeWindow.receivePostMessageFromIframe(
        PostMessages.UNLOCKED,
        unlockedLockAddresses,
        iframes.data.iframe,
        dataOrigin
      )

      expect(handler.getCachedLockState()).toBe(false)
    })

    it('should dispatch unlockProtocol event, unlocked', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.init()
      handler.dispatchEvent = jest.fn()

      const unlockedLockAddresses = ['address']
      fakeWindow.receivePostMessageFromIframe(
        PostMessages.UNLOCKED,
        unlockedLockAddresses,
        iframes.data.iframe,
        dataOrigin
      )

      expect(handler.dispatchEvent).toHaveBeenCalledWith('unlocked')
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
      handler.init()
      handler.hideCheckoutIframe = jest.fn()

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
      iframes.accounts.createIframe()
      handler.init()
      handler.showAccountIframe = jest.fn()

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
      iframes.accounts.createIframe()
      handler.init()
      handler.hideAccountIframe = jest.fn()

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
