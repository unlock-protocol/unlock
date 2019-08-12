import FakeWindow from '../test-helpers/fakeWindowHelpers'
import CheckoutUIHandler from '../../unlock.js/CheckoutUIHandler'
import { PaywallConfig, Locks } from '../../unlockTypes'
import IframeHandler from '../../unlock.js/IframeHandler'
import { PostMessages, ExtractPayload } from '../../messageTypes'

declare const process: {
  env: {
    PAYWALL_URL: 'http://paywall'
    USER_IFRAME_URL: 'http://app/account'
  }
}

describe('CheckoutUIHandler', () => {
  process.env.PAYWALL_URL = 'http://paywall'
  process.env.USER_IFRAME_URL = 'http://app/account'
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const dataIframeUrl = process.env.PAYWALL_URL + '/data'
  const checkoutIframeUrl = process.env.PAYWALL_URL + '/checkout'
  const accountsIframeUrl = process.env.USER_IFRAME_URL
  const dataOrigin = process.env.PAYWALL_URL
  const checkoutOrigin = process.env.PAYWALL_URL
  const fakeAccount = '0x1234567890123456789012345678901234567890'
  const fakeLocks: Locks = {
    [fakeAccount]: {
      name: 'lock',
      address: fakeAccount,
      keyPrice: '23',
      expirationDuration: 0,
      currencyContractAddress: null,
      key: {
        owner: fakeAccount,
        expiration: 0,
        status: 'none',
        confirmations: 0,
        lock: fakeAccount,
        transactions: [],
      },
    },
  }
  const config: PaywallConfig = {
    locks: {},
    callToAction: {
      default: 'hi',
      expired: 'hi',
      pending: 'hi',
      confirmed: 'hi',
    },
  }

  function makeCheckoutUIHandler(fakeWindow: FakeWindow) {
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      accountsIframeUrl
    )
    iframes.init(config)
    return new CheckoutUIHandler(iframes, config)
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  describe('when the checkout iframe is ready', () => {
    function makeReadyCheckout() {
      fakeWindow = new FakeWindow()
      const handler = makeCheckoutUIHandler(fakeWindow)
      handler.init()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY,
        undefined,
        iframes.checkout.iframe,
        checkoutOrigin
      )
    }

    it('should send the paywall configuration to the checkout iframe', () => {
      expect.assertions(1)

      makeReadyCheckout()

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.CONFIG,
        config,
        iframes.checkout.iframe,
        checkoutOrigin
      )
    })

    it('should request the latest account', () => {
      expect.assertions(1)

      makeReadyCheckout()

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.SEND_UPDATES,
        'account',
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should request the latest account balance', () => {
      expect.assertions(1)

      makeReadyCheckout()

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.SEND_UPDATES,
        'balance',
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should request the latest network', () => {
      expect.assertions(1)

      makeReadyCheckout()

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.SEND_UPDATES,
        'network',
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should request the latest locks', () => {
      expect.assertions(1)

      makeReadyCheckout()

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.SEND_UPDATES,
        'locks',
        iframes.data.iframe,
        dataOrigin
      )
    })
  })

  describe('relayed messages', () => {
    type RelayedMessageTestType<T extends PostMessages = PostMessages> = [
      string,
      T,
      ExtractPayload<T>
    ][]

    const data: RelayedMessageTestType = [
      ['UPDATE_ACCOUNT', PostMessages.UPDATE_ACCOUNT, fakeAccount],
      ['UPDATE_ACCOUNT_BALANCE', PostMessages.UPDATE_ACCOUNT_BALANCE, '123'],
      ['UPDATE_LOCKS', PostMessages.UPDATE_LOCKS, fakeLocks],
      ['UPDATE_NETWORK', PostMessages.UPDATE_NETWORK, 3],
      ['UPDATE_WALLET', PostMessages.UPDATE_WALLET, true],
      ['ERROR', PostMessages.ERROR, 'error message'],
      ['LOCKED', PostMessages.LOCKED, undefined],
      ['UNLOCKED', PostMessages.UNLOCKED, [fakeAccount]],
    ]

    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it.each(data)(
      'should relay PostMessages.%s from the data iframe to the checkout iframe',
      (_, type, payload) => {
        expect.assertions(1)

        const handler = makeCheckoutUIHandler(fakeWindow)
        handler.init()

        fakeWindow.receivePostMessageFromIframe(
          type,
          payload,
          iframes.data.iframe,
          dataOrigin
        )

        fakeWindow.expectPostMessageSentToIframe(
          type,
          payload,
          iframes.checkout.iframe,
          checkoutOrigin
        )
      }
    )
  })
})
