import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import Wallet from '../../../unlock.js/Wallet'
import StartupConstants from '../../../unlock.js/startupTypes'

describe('Wallet.setupProxyWallet()', () => {
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
    debug: 0,
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
    const wallet = new Wallet(fakeWindow, iframes, configuration, startup)
    wallet.setupUserAccountsProxyWallet = jest.fn()
    wallet.setupWeb3ProxyWallet = jest.fn()
    return wallet
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  it('should setup user accounts for no wallet, user accounts in config', () => {
    expect.assertions(1)

    const wallet = makeWallet(userAccountsConfig)
    wallet.setupProxyWallet()

    expect(wallet.setupUserAccountsProxyWallet).toHaveBeenCalled()
  })

  it('should not setup user accounts if there is a crypto wallet', () => {
    expect.assertions(1)

    fakeWindow.makeWeb3()
    const wallet = makeWallet(userAccountsConfig)
    wallet.setupProxyWallet()

    expect(wallet.setupWeb3ProxyWallet).toHaveBeenCalled()
  })

  it('should not setup user accounts if there is no crypto wallet, and no user accounts in config', () => {
    expect.assertions(1)

    const wallet = makeWallet()
    wallet.setupProxyWallet()

    expect(wallet.setupWeb3ProxyWallet).toHaveBeenCalled()
  })
})
