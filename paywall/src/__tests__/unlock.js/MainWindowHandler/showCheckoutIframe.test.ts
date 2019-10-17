import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'

describe('MainWindowHandler - showCheckoutIframe', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler

  function getMainWindowHandler() {
    // iframe URLs are unused in this test
    iframes = new IframeHandler(fakeWindow, 'http://t', 'http://u', 'http://v')
    return new MainWindowHandler(fakeWindow, iframes)
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
