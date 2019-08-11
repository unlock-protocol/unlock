import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig, Locks } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import Wallet from '../../../unlock.js/Wallet'
import StartupConstants from '../../../unlock.js/startupTypes'
import { PostMessages } from '../../../messageTypes'

declare const process: {
  env: {
    PAYWALL_URL: string
    USER_IFRAME_URL: string
  }
}

describe('Wallet.setupUserAccounts()', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  let wallet: Wallet
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const userIframeUrl = 'http://app/accounts'
  const dataOrigin = 'http://paywall'
  const checkoutOrigin = 'http://paywall'
  const accountsOrigin = 'http://app'
  const fakeAddress = '0x1234567890123456789012345678901234567890'
  const config: PaywallConfig = {
    locks: {},
    callToAction: {
      default: '',
      pending: '',
      confirmed: '',
      expired: '',
    },
    unlockUserAccounts: true,
  }
  const startup: StartupConstants = {
    network: 1984,
  }
  process.env.PAYWALL_URL = 'http://paywall'
  process.env.USER_IFRAME_URL = 'http://app/accounts'

  function makeWallet() {
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )
    iframes.init(config)
    wallet = new Wallet(fakeWindow, iframes, config, startup)
    wallet.setupUserAccounts()
  }

  function testingWallet() {
    return wallet as any
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
    makeWallet()
  })

  it('should forward locks to the accounts iframe', () => {
    expect.assertions(1)

    const locks: Locks = {
      [fakeAddress]: {
        address: fakeAddress,
        name: 'lock',
        keyPrice: '1',
        expirationDuration: 123,
        currencyContractAddress: fakeAddress,
        key: {
          lock: fakeAddress,
          expiration: 0,
          status: 'none',
          owner: null,
          confirmations: 0,
          transactions: [],
        },
      },
    }

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.UPDATE_LOCKS,
      locks,
      iframes.data.iframe,
      dataOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.UPDATE_LOCKS,
      locks,
      iframes.accounts.iframe,
      accountsOrigin
    )
  })

  it('should forward configuration to accounts when ready', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.READY,
      undefined,
      iframes.accounts.iframe,
      accountsOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.CONFIG,
      config,
      iframes.accounts.iframe,
      accountsOrigin
    )
  })

  it('should request the latest locks from the data iframe when ready', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.READY,
      undefined,
      iframes.accounts.iframe,
      accountsOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.SEND_UPDATES,
      'locks',
      iframes.data.iframe,
      dataOrigin
    )
  })

  it('should forward purchase requests to the account iframe', () => {
    expect.assertions(1)

    const purchaseRequest = {
      lock: fakeAddress,
      extraTip: '0',
    }
    fakeWindow.receivePostMessageFromIframe(
      PostMessages.PURCHASE_KEY,
      purchaseRequest,
      iframes.checkout.iframe,
      checkoutOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.PURCHASE_KEY,
      purchaseRequest,
      iframes.accounts.iframe,
      accountsOrigin
    )
  })

  it('should forward transaction initiated notice to the data iframe', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.INITIATED_TRANSACTION,
      undefined,
      iframes.accounts.iframe,
      accountsOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.INITIATED_TRANSACTION,
      undefined,
      iframes.data.iframe,
      dataOrigin
    )
  })

  it('should store user accounts address', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.UPDATE_ACCOUNT,
      fakeAddress,
      iframes.accounts.iframe,
      accountsOrigin
    )

    expect(testingWallet().userAccountAddress).toBe(fakeAddress)
  })

  it('should store user accounts network', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.UPDATE_NETWORK,
      1,
      iframes.accounts.iframe,
      accountsOrigin
    )

    expect(testingWallet().userAccountNetwork).toBe(1)
  })

  it('should create the accounts iframe', () => {
    expect.assertions(1)

    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )
    iframes.init(config)
    wallet = new Wallet(fakeWindow, iframes, config, startup)
    iframes.accounts.createIframe = jest.fn()
    wallet.setupUserAccounts()

    expect(iframes.accounts.createIframe).toHaveBeenCalled()
  })
})
