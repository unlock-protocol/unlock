import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'

describe('MainWindowHandler - hideCheckoutIframe', () => {
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

  it('should call hideIframe() on the checkout iframe', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    iframes.checkout.hideIframe = jest.fn()

    handler.hideCheckoutIframe()

    expect(iframes.checkout.hideIframe).toHaveBeenCalled()
  })
})
