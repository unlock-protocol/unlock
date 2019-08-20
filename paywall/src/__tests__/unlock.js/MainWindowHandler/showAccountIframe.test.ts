import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'

describe('MainWindowHandler - showAccountIframe', () => {
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
