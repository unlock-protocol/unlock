import IframeHandler from '../../unlock.js/IframeHandler'
import FakeWindow from '../test-helpers/fakeWindowHelpers'
import DataIframeMessageEmitter from '../../unlock.js/PostMessageEmitters/DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from '../../unlock.js/PostMessageEmitters/CheckoutIframeMessageEmitter'
import AccountsIframeMessageEmitter from '../../unlock.js/PostMessageEmitters/AccountsIframeMessageEmitter'
import { PostMessages } from '../../messageTypes'
import { PaywallConfig } from '../../unlockTypes'

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
  const config: PaywallConfig = {
    locks: {},
    callToAction: {
      default: 'hi',
      expired: 'hi',
      pending: 'hi',
      confirmed: 'hi',
    },
  }

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

  it('should not create and initialize the accounts iframe', () => {
    expect.assertions(1)

    const ready = jest.fn()
    const iframeHandler = makeIframeHandler()
    iframeHandler.accounts.createIframe = jest.fn()
    iframeHandler.init(config)

    iframeHandler.accounts.addHandler(PostMessages.READY, ready)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.READY,
      undefined,
      iframeHandler.accounts.iframe,
      'http://app'
    )

    expect(ready).not.toHaveBeenCalled()
  })

  it('should set up postmessage listeners for the data and checkout iframes', () => {
    expect.assertions(2)

    const iframeHandler = makeIframeHandler()
    iframeHandler.checkout.setupListeners = jest.fn()
    iframeHandler.data.setupListeners = jest.fn()

    iframeHandler.init(config)

    expect(iframeHandler.checkout.setupListeners).toHaveBeenCalled()
    expect(iframeHandler.data.setupListeners).toHaveBeenCalled()
  })

  it('should listen for PostMessages.READY emit, and send the config to the data iframe on receipt', () => {
    expect.assertions(1)

    const iframeHandler = makeIframeHandler()
    iframeHandler.init(config)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.READY,
      undefined,
      iframeHandler.data.iframe,
      'http://paywall'
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.CONFIG,
      config,
      iframeHandler.data.iframe,
      'http://paywall'
    )
  })
})
