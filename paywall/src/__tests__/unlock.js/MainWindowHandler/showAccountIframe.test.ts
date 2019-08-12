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

describe('MainWindowHandler - showAccountIframe', () => {
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

  it('should show the account iframe', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    iframes.accounts.showIframe = jest.fn()

    handler.showAccountIframe()

    expect(iframes.accounts.showIframe).toHaveBeenCalled()
  })

  it('should hide the checkout if it used to be visible', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.showCheckoutIframe()
    iframes.checkout.hideIframe = jest.fn()
    handler.showAccountIframe()

    expect(iframes.checkout.hideIframe).toHaveBeenCalled()
  })

  it('should not hide the checkout if it was not visible', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    iframes.checkout.hideIframe = jest.fn()

    handler.showAccountIframe()

    expect(iframes.checkout.hideIframe).not.toHaveBeenCalled()
  })
})
