import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'

describe('MainWindowHandler - hideCheckoutIframe', () => {
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

  it('should call hideIframe() on the checkout iframe', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    iframes.checkout.hideIframe = jest.fn()

    handler.hideCheckoutIframe()

    expect(iframes.checkout.hideIframe).toHaveBeenCalled()
  })
})
