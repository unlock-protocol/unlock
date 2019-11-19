import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig, PurchaseKeyRequest } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import { PostMessages } from '../../../messageTypes'
import { setupWeb3ProxyWallet } from '../../../unlock.js/postMessageHub'

describe('setupWeb3ProxyWallet()', () => {
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const userIframeUrl = 'http://app/accounts'
  const dataOrigin = 'http://paywall'
  //const checkoutOrigin = 'http://paywall'
  const fakeAddress = '0x1234567890123456789012345678901234567890'
  const config: PaywallConfig = {
    locks: {},
    callToAction: {
      default: '',
      pending: '',
      confirmed: '',
      expired: '',
      noWallet: '',
    },
    unlockUserAccounts: true,
  }

  function init({ getHasWallet, setHasWeb3, getHasWeb3, isMetamask }: any) {
    let fakeWindow = new FakeWindow()
    fakeWindow.makeWeb3()
    let iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )
    iframes.init(config)
    setupWeb3ProxyWallet({
      iframes,
      getHasWallet: getHasWallet || jest.fn(),
      setHasWeb3: setHasWeb3 || jest.fn(),
      getHasWeb3: getHasWeb3 || jest.fn(),
      isMetamask: isMetamask || true,
      window: fakeWindow,
    })

    return {
      iframes,
      window: fakeWindow,
    }
  }

  it('should forward purchase requests to the data iframe', () => {
    expect.assertions(1)

    const { iframes, window } = init({})

    const request: PurchaseKeyRequest = {
      lock: fakeAddress,
      extraTip: '0',
    }

    iframes.checkout.emit(PostMessages.PURCHASE_KEY, request)

    window.expectPostMessageSentToIframe(
      PostMessages.PURCHASE_KEY,
      request,
      iframes.data.iframe,
      dataOrigin
    )
  })
})
