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

describe('Wallet.setupProxyWallet()', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const userIframeUrl = 'http://app/accounts'
  const configuration: PaywallConfig = {
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
  process.env.PAYWALL_URL = 'http://paywall'
  process.env.USER_IFRAME_URL = 'http://app/accounts'

  function makeWallet() {
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )
    const wallet = new Wallet(fakeWindow, iframes, configuration, startup)
    return wallet
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  it('should return without error if there is no web3', async () => {
    expect.assertions(0)

    const wallet = makeWallet()
    await wallet.enableCryptoWallet()
  })

  it('should return without error if there is web3, but no enable', async () => {
    expect.assertions(0)

    fakeWindow.makeWeb3()
    const wallet = makeWallet()
    await wallet.enableCryptoWallet()
  })

  it('should call enable if present', async () => {
    expect.assertions(1)

    fakeWindow.makeWeb3()
    fakeWindow.web3 && (fakeWindow.web3.currentProvider.enable = jest.fn())
    const wallet = makeWallet()
    await wallet.enableCryptoWallet()

    expect(
      fakeWindow.web3 && fakeWindow.web3.currentProvider.enable
    ).toHaveBeenCalled()
  })
})
