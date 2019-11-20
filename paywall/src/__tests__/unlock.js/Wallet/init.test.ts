import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import Wallet from '../../../unlock.js/Wallet'
import StartupConstants from '../../../unlock.js/startupTypes'
import * as postMessageHub from '../../../unlock.js/postMessageHub'

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
      noWallet: '',
    },
  }

  const startup: StartupConstants = {
    network: 1984,
    debug: 0,
    paywallUrl: 'http://paywall',
    accountsUrl: 'http://app/accounts',
    erc20ContractAddress: '0x591AD9066603f5499d12fF4bC207e2f577448c46',
  }
  const userAccountsConfig: PaywallConfig = {
    ...regularConfig,
    unlockUserAccounts: true,
  }

  function makeWallet(configuration = regularConfig) {
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )
    return new Wallet(fakeWindow, iframes, configuration, startup)
  }

  function setupUserAccountsSpy() {
    return jest.spyOn(postMessageHub, 'setupUserAccounts')
  }

  function setupUserAccountsProxyWalletSpy() {
    return jest.spyOn(postMessageHub, 'setupUserAccountsProxyWallet')
  }

  function setupWeb3ProxyWalletSpy() {
    return jest.spyOn(postMessageHub, 'setupWeb3ProxyWallet')
  }

  describe('has crypto wallet', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
      fakeWindow.makeWeb3()
    })

    it('should use crypto wallet if one exists on window', () => {
      expect.assertions(1)

      const handler = makeWallet()
      const setupUserAccounts = setupUserAccountsSpy()

      handler.init()

      expect(setupUserAccounts).not.toHaveBeenCalled()
    })

    it('should not setup user accounts if there is a crypto wallet', () => {
      expect.assertions(1)

      fakeWindow.makeWeb3()
      const handler = makeWallet(userAccountsConfig)
      const setupWeb3ProxyWallet = setupWeb3ProxyWalletSpy()
      handler.init()

      expect(setupWeb3ProxyWallet).toHaveBeenCalled()
    })

    it('should not setup user accounts if there is no crypto wallet, and no user accounts in config', () => {
      expect.assertions(1)

      const handler = makeWallet()
      const setupWeb3ProxyWallet = setupWeb3ProxyWalletSpy()
      handler.init()

      expect(setupWeb3ProxyWallet).toHaveBeenCalled()
    })
  })

  describe('has no crypto wallet', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should use crypto wallet if config does not ask for user accounts', () => {
      expect.assertions(1)

      const handler = makeWallet()
      const setupUserAccounts = setupUserAccountsSpy()

      handler.init()

      expect(setupUserAccounts).not.toHaveBeenCalled()
    })

    it('should use user accounts proxy wallet if user accounts specified', () => {
      expect.assertions(2)

      const handler = makeWallet(userAccountsConfig)
      const setupUserAccounts = setupUserAccountsSpy()
      const setupUserAccountsProxyWallet = setupUserAccountsProxyWalletSpy()

      handler.init()

      expect(setupUserAccounts).toHaveBeenCalled()
      expect(setupUserAccountsProxyWallet).toHaveBeenCalled()
    })

    it('should use user accounts proxy wallet if user accounts specified as "true"', () => {
      expect.assertions(2)

      const handler = makeWallet({
        ...userAccountsConfig,
        unlockUserAccounts: 'true',
      })
      const setupUserAccounts = setupUserAccountsSpy()
      const setupUserAccountsProxyWallet = setupUserAccountsProxyWalletSpy()

      handler.init()

      expect(setupUserAccounts).toHaveBeenCalled()
      expect(setupUserAccountsProxyWallet).toHaveBeenCalled()
    })

    it('should setup user accounts for no wallet, user accounts in config', () => {
      expect.assertions(1)

      const handler = makeWallet(userAccountsConfig)
      const setupUserAccountsProxyWallet = setupUserAccountsProxyWalletSpy()
      handler.init()

      expect(setupUserAccountsProxyWallet).toHaveBeenCalled()
    })
  })
})
