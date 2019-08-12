import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'

describe('MainWindowHandler - hideAccountIframe', () => {
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
    // iframe URLs are unused in this test
    iframes = new IframeHandler(fakeWindow, 'http://t', 'http://u', 'http://v')
    return new MainWindowHandler(fakeWindow, iframes, config)
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  it('should hide the account iframe', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    iframes.accounts.hideIframe = jest.fn()

    handler.hideAccountIframe()

    expect(iframes.accounts.hideIframe).toHaveBeenCalled()
  })

  it('should show the checkout if it used to be visible', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.showCheckoutIframe()
    handler.showAccountIframe()
    iframes.checkout.showIframe = jest.fn()

    handler.hideAccountIframe()

    expect(iframes.checkout.showIframe).toHaveBeenCalled()
  })

  it('should not show the checkout if it used to be invisible', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    iframes.checkout.showIframe = jest.fn()

    handler.hideAccountIframe()

    expect(iframes.checkout.showIframe).not.toHaveBeenCalled()
  })
})
