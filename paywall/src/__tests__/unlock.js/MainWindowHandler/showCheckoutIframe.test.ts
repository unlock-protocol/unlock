import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'

declare const process: {
  env: {
    PAYWALL_URL: string
    USER_IFRAME_URL: string
  }
}

describe('MainWindowHandler - showCheckoutIframe', () => {
  process.env.PAYWALL_URL = 'http://paywall'
  process.env.USER_IFRAME_URL = 'http://app/account'
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const config: PaywallConfig = {
    locks: {},
    callToAction: {
      default: '',
      pending: '',
      expired: '',
      confirmed: '',
    },
  }

  function getMainWindowHandler() {
    iframes = new IframeHandler(fakeWindow, '', '', '')
    return new MainWindowHandler(fakeWindow, iframes, config)
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  it('should show the checkout iframe', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    iframes.checkout.showIframe = jest.fn()

    handler.showCheckoutIframe()

    expect(iframes.checkout.showIframe).toHaveBeenCalled()
  })

  it('should not show the checkout iframe if the accounts iframe is visible', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.showAccountIframe()
    handler.showCheckoutIframe()
    iframes.checkout.showIframe = jest.fn()

    expect(iframes.checkout.showIframe).not.toHaveBeenCalled()
  })

  it('should show the checkout iframe after the accounts iframe hides', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.showAccountIframe()
    handler.showCheckoutIframe()
    iframes.checkout.showIframe = jest.fn()

    handler.hideAccountIframe()

    expect(iframes.checkout.showIframe).toHaveBeenCalled()
  })
})
