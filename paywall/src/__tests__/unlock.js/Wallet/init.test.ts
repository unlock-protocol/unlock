import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import Wallet from '../../../unlock.js/Wallet'
import StartupConstants from '../../../unlock.js/startupTypes'

declare const process: {
  env: {
    PAYWALL_URL: string
    USER_IFRAME_URL: string
  }
}

describe('Wallet.init()', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const userIframeUrl = 'http://app/accounts'
  const regularConfig: PaywallConfig = {
    locks: {},
    callToAction: {
      default: '',
      pending: '',
      confirmed: '',
      expired: '',
    },
  }
  const startup: StartupConstants = {
    network: 1984,
  }
  const userAccountsConfig: PaywallConfig = {
    ...regularConfig,
    unlockUserAccounts: true,
  }
  process.env.PAYWALL_URL = 'http://paywall'
  process.env.USER_IFRAME_URL = 'http://app/accounts'

  function makeWallet(configuration = regularConfig) {
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )
    return new Wallet(fakeWindow, iframes, configuration, startup)
  }

  describe('has crypto wallet', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
      fakeWindow.makeWeb3()
    })

    it('should use crypto wallet if one exists on window', () => {
      expect.assertions(1)

      const handler = makeWallet()
      handler.setupUserAccounts = jest.fn()
      handler.setupProxyWallet = jest.fn()

      handler.init()

      expect(handler.setupUserAccounts).not.toHaveBeenCalled()
    })

    it('should set up the proxy wallet if using the crypto wallet', () => {
      expect.assertions(1)

      const handler = makeWallet()
      handler.setupUserAccounts = jest.fn()
      handler.setupProxyWallet = jest.fn()

      handler.init()

      expect(handler.setupProxyWallet).toHaveBeenCalled()
    })

    it('should use crypto wallet even if user accounts specified', () => {
      expect.assertions(1)

      const handler = makeWallet(userAccountsConfig)
      handler.setupUserAccounts = jest.fn()
      handler.setupProxyWallet = jest.fn()

      handler.init()

      expect(handler.setupProxyWallet).toHaveBeenCalled()
    })
  })

  describe('has no crypto wallet', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should use crypto wallet if config does not ask for user accounts', () => {
      expect.assertions(1)

      const handler = makeWallet()
      handler.setupUserAccounts = jest.fn()
      handler.setupProxyWallet = jest.fn()

      handler.init()

      expect(handler.setupUserAccounts).not.toHaveBeenCalled()
    })

    it('should use user accounts proxy wallet if user accounts specified', () => {
      expect.assertions(1)

      const handler = makeWallet(userAccountsConfig)
      handler.setupUserAccounts = jest.fn()
      handler.setupProxyWallet = jest.fn()

      fakeWindow.makeWeb3()
      handler.init()

      expect(handler.setupUserAccounts).toHaveBeenCalled()
    })

    it('should set up the proxy wallet if user accounts specified', () => {
      expect.assertions(1)

      const handler = makeWallet(userAccountsConfig)
      handler.setupUserAccounts = jest.fn()
      handler.setupProxyWallet = jest.fn()

      fakeWindow.makeWeb3()
      handler.init()

      expect(handler.setupProxyWallet).toHaveBeenCalled()
    })

    it('should use user accounts proxy wallet if user accounts specified as "true"', () => {
      expect.assertions(1)

      const handler = makeWallet({
        ...userAccountsConfig,
        unlockUserAccounts: 'true',
      })
      handler.setupUserAccounts = jest.fn()
      handler.setupProxyWallet = jest.fn()

      fakeWindow.makeWeb3()
      handler.init()

      expect(handler.setupUserAccounts).toHaveBeenCalled()
    })
  })
})
