import startup, { normalizeConfig } from '../../unlock.js/startup'
import FakeWindow from '../test-helpers/fakeWindowHelpers'
import StartupConstants from '../../unlock.js/startupTypes'
import { PaywallConfig } from '../../unlockTypes'
import { PostMessages } from '../../messageTypes'
import { UnlockWindow } from '../../windowTypes'

describe('unlock.js startup', () => {
  describe('normalizeConfig', () => {
    type badConfigs = [string, any][]
    it.each(<badConfigs>[
      ['false', false],
      ['no locks', {}],
      ['locks is not an object', { locks: 5 }],
      ['locks is empty', { locks: {} }],
    ])('should return invalid config (%s) as-is', (_, badConfig) => {
      expect.assertions(1)

      expect(normalizeConfig(badConfig)).toBe(badConfig)
    })

    it('should normalize the lock addresses to lower-case', () => {
      expect.assertions(1)

      const config: PaywallConfig = {
        locks: {
          ABC: { name: 'hi' },
          def: { name: 'there' },
          AbQ: { name: 'foo' },
        },
        callToAction: {
          default: 'hi',
          expired: 'there',
          pending: 'pending',
          confirmed: 'confirmed',
        },
      }
      const normalizedConfig = {
        ...config,
        locks: {
          abc: { name: 'hi' },
          def: { name: 'there' },
          abq: { name: 'foo' },
        },
      }

      expect(normalizeConfig(config)).toEqual(normalizedConfig)
    })
  })

  describe('startup', () => {
    let fakeWindow: FakeWindow
    const config: PaywallConfig = {
      locks: {
        ABC: { name: 'hi' },
        def: { name: 'there' },
        AbQ: { name: 'foo' },
      },
      callToAction: {
        default: 'hi',
        expired: 'there',
        pending: 'pending',
        confirmed: 'confirmed',
      },
    }

    const normalizedConfig = {
      ...config,
      locks: {
        abc: { name: 'hi' },
        def: { name: 'there' },
        abq: { name: 'foo' },
      },
    }
    const constants: StartupConstants = {
      network: 4,
      debug: 0,
      paywallUrl: 'http://paywall',
      accountsUrl: 'http://app/account',
    }
    const dataOrigin = 'http://paywall'
    const checkoutOrigin = 'http://paywall'
    const accountsOrigin = 'http://app'

    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should not crash if there is no configuration on the window', () => {
      expect.assertions(0)

      startup(fakeWindow, constants)
    })

    // verify the IframeHandler is set up
    it('should set up the data iframe', async () => {
      expect.assertions(1)

      fakeWindow.unlockProtocolConfig = config
      const iframes = startup(fakeWindow, constants)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )

      await fakeWindow.waitForPostMessageToIframe(iframes.data.iframe)

      // note: this also tests that the configuration is normalized
      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.CONFIG,
        normalizedConfig,
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should load the data iframe with the correct URL', () => {
      expect.assertions(1)

      fakeWindow.unlockProtocolConfig = config
      const iframes = startup(fakeWindow, constants)

      expect(iframes.data.iframe.src).toBe(
        dataOrigin +
          '/static/data-iframe.1.0.html?origin=' +
          encodeURIComponent(fakeWindow.origin)
      )
    })

    it('should load the checkout iframe with the correct URL', () => {
      expect.assertions(1)

      fakeWindow.unlockProtocolConfig = config
      const iframes = startup(fakeWindow, constants)

      expect(iframes.checkout.iframe.src).toBe(
        dataOrigin + '/checkout?origin=' + encodeURIComponent(fakeWindow.origin)
      )
    })

    it('should create the dummy accounts iframe with the correct URL', () => {
      expect.assertions(1)

      fakeWindow.unlockProtocolConfig = config
      const iframes = startup(fakeWindow, constants)

      expect(iframes.accounts.iframe.src).toBe(
        accountsOrigin +
          '/account?origin=' +
          encodeURIComponent(fakeWindow.origin)
      )
    })

    // verify we created CheckoutUIHandler and called init()
    it('should set up the checkout iframe', async () => {
      expect.assertions(1)

      fakeWindow.unlockProtocolConfig = config
      const iframes = startup(fakeWindow, constants)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY,
        undefined,
        iframes.checkout.iframe,
        checkoutOrigin
      )

      await fakeWindow.waitForPostMessageToIframe(iframes.checkout.iframe)

      // note: this also tests that the configuration is normalized
      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.CONFIG,
        normalizedConfig,
        iframes.checkout.iframe,
        checkoutOrigin
      )
    })

    // verify we instantiate the Wallet and called init()
    it('should set up the crypto wallet if present', async () => {
      expect.assertions(1)

      fakeWindow.unlockProtocolConfig = config
      fakeWindow.makeWeb3()
      const iframes = startup(fakeWindow, constants)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY_WEB3,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )

      await fakeWindow.waitForPostMessageToIframe(iframes.data.iframe)

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WALLET_INFO,
        {
          noWallet: false,
          notEnabled: false,
          isMetamask: false,
        },
        iframes.data.iframe,
        dataOrigin
      )
    })

    // verify we instantiate the MainWindowHandler and called init()
    it('should set up the main window unlockProtocol variable', async () => {
      expect.assertions(1)

      fakeWindow.unlockProtocolConfig = {
        ...config,
        unlockUserAccounts: true,
      }
      const iframes = startup(fakeWindow, constants)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY_WEB3,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )

      expect(
        ((fakeWindow as unknown) as UnlockWindow).unlockProtocol
      ).not.toBeUndefined()
    })
  })
})
