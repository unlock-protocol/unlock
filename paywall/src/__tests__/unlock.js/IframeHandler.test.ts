import IframeHandler from '../../unlock.js/IframeHandler'
import FakeWindow from '../test-helpers/fakeWindowHelpers'
import DataIframeMessageEmitter from '../../unlock.js/PostMessageEmitters/DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from '../../unlock.js/PostMessageEmitters/CheckoutIframeMessageEmitter'
import AccountsIframeMessageEmitter from '../../unlock.js/PostMessageEmitters/AccountsIframeMessageEmitter'

declare const process: {
  env: {
    PAYWALL_URL: string
    USER_IFRAME_URL: string
  }
}

describe('IframeHandler', () => {
  process.env.PAYWALL_URL = 'http://paywall'
  process.env.USER_IFRAME_URL = 'http://app/account'
  let fakeWindow: FakeWindow

  function makeIframeHandler() {
    return new IframeHandler(
      fakeWindow,
      'http://paywall/data',
      'http://paywall/checkout',
      'http://app/accounts'
    )
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  it('should set up a data iframe emitter', () => {
    expect.assertions(1)

    const iframeHandler = makeIframeHandler()

    expect(iframeHandler.data).toBeInstanceOf(DataIframeMessageEmitter)
  })

  it('should set up a checkout iframe emitter', () => {
    expect.assertions(1)

    const iframeHandler = makeIframeHandler()

    expect(iframeHandler.checkout).toBeInstanceOf(CheckoutIframeMessageEmitter)
  })

  it('should set up a user accounts iframe emitter', () => {
    expect.assertions(1)

    const iframeHandler = makeIframeHandler()

    expect(iframeHandler.accounts).toBeInstanceOf(AccountsIframeMessageEmitter)
  })
})
