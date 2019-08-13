import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import Wallet from '../../../unlock.js/Wallet'
import StartupConstants from '../../../unlock.js/startupTypes'
import { PostMessages } from '../../../messageTypes'

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
    debug: 0,
  }

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
    wallet.setupUserAccountsProxyWallet()
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
    makeWallet()
  })

  it('should request account from the accounts iframe when it is ready', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.READY,
      undefined,
      iframes.accounts.iframe,
      accountsOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.SEND_UPDATES,
      'account',
      iframes.accounts.iframe,
      accountsOrigin
    )
  })

  it('should request network from the accounts iframe when it is ready', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.READY,
      undefined,
      iframes.accounts.iframe,
      accountsOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.SEND_UPDATES,
      'network',
      iframes.accounts.iframe,
      accountsOrigin
    )
  })

  it('should enable the user accounts proxy wallet when the data iframe is ready', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.READY_WEB3,
      undefined,
      iframes.data.iframe,
      dataOrigin
    )

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

  it('should return account when eth_accounts web3 call is sent', () => {
    expect.assertions(1)

    // set up the account to rreturn
    fakeWindow.receivePostMessageFromIframe(
      PostMessages.UPDATE_ACCOUNT,
      fakeAddress,
      iframes.accounts.iframe,
      accountsOrigin
    )

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.WEB3,
      {
        method: 'eth_accounts',
        jsonrpc: '2.0',
        params: [],
        id: 2,
      },
      iframes.data.iframe,
      dataOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.WEB3_RESULT,
      {
        id: 2,
        jsonrpc: '2.0',
        result: {
          id: 2,
          jsonrpc: '2.0',
          result: [fakeAddress],
        },
      },
      iframes.data.iframe,
      dataOrigin
    )
  })

  it('should return [] when eth_accounts web3 call is sent and account is null', () => {
    expect.assertions(1)

    // set up the account to rreturn
    fakeWindow.receivePostMessageFromIframe(
      PostMessages.UPDATE_ACCOUNT,
      null,
      iframes.accounts.iframe,
      accountsOrigin
    )

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.WEB3,
      {
        method: 'eth_accounts',
        jsonrpc: '2.0',
        params: [],
        id: 2,
      },
      iframes.data.iframe,
      dataOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.WEB3_RESULT,
      {
        id: 2,
        jsonrpc: '2.0',
        result: {
          id: 2,
          jsonrpc: '2.0',
          result: [],
        },
      },
      iframes.data.iframe,
      dataOrigin
    )
  })

  it('should return default network when net_version web3 call is sent before accounts is ready', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.WEB3,
      {
        method: 'net_version',
        jsonrpc: '2.0',
        params: [],
        id: 2,
      },
      iframes.data.iframe,
      dataOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.WEB3_RESULT,
      {
        id: 2,
        jsonrpc: '2.0',
        result: {
          id: 2,
          jsonrpc: '2.0',
          result: startup.network,
        },
      },
      iframes.data.iframe,
      dataOrigin
    )
  })

  it('should return accounts network when net_version web3 call is sent', () => {
    expect.assertions(1)

    // set up the network to rreturn
    fakeWindow.receivePostMessageFromIframe(
      PostMessages.UPDATE_NETWORK,
      1,
      iframes.accounts.iframe,
      accountsOrigin
    )

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.WEB3,
      {
        method: 'net_version',
        jsonrpc: '2.0',
        params: [],
        id: 2,
      },
      iframes.data.iframe,
      dataOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.WEB3_RESULT,
      {
        id: 2,
        jsonrpc: '2.0',
        result: {
          id: 2,
          jsonrpc: '2.0',
          result: 1,
        },
      },
      iframes.data.iframe,
      dataOrigin
    )
  })

  it('should error on any other web3 call is sent', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.WEB3,
      {
        method: 'foo_bar',
        jsonrpc: '2.0',
        params: [],
        id: 2,
      },
      iframes.data.iframe,
      dataOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.WEB3_RESULT,
      {
        id: 2,
        jsonrpc: '2.0',
        error: '"foo_bar" is not supported',
      },
      iframes.data.iframe,
      dataOrigin
    )
  })
})
