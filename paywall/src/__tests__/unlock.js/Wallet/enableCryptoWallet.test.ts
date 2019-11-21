import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import IframeHandler from '../../../unlock.js/IframeHandler'
import { enableCryptoWallet } from '../../../unlock.js/postMessageHub'

describe('enableCryptoWallet()', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const userIframeUrl = 'http://app/accounts'

  beforeEach(() => {
    fakeWindow = new FakeWindow()
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )
  })

  it('should return without error if there is no web3', async () => {
    expect.assertions(0)

    await enableCryptoWallet(fakeWindow, iframes)
  })

  it('should return without error if there is web3, but no enable', async () => {
    expect.assertions(0)

    fakeWindow.makeWeb3()
    await enableCryptoWallet(fakeWindow, iframes)
  })

  it('should call enable if present', async () => {
    expect.assertions(1)

    fakeWindow.makeWeb3()
    fakeWindow.web3 && (fakeWindow.web3.currentProvider.enable = jest.fn())
    await enableCryptoWallet(fakeWindow, iframes)

    expect(
      fakeWindow.web3 && fakeWindow.web3.currentProvider.enable
    ).toHaveBeenCalled()
  })
})
