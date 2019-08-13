import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig, PurchaseKeyRequest } from '../../../unlockTypes'
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
    paywallUrl: 'http://paywall',
    accountsUrl: 'http://app/accounts',
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
    wallet.setupWeb3ProxyWallet()
    return wallet
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
    fakeWindow.makeWeb3()
    makeWallet()
  })

  it('should forward purchase requests to the data iframe', () => {
    expect.assertions(1)

    const request: PurchaseKeyRequest = {
      lock: fakeAddress,
      extraTip: '0',
    }

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.PURCHASE_KEY,
      request,
      iframes.checkout.iframe,
      checkoutOrigin
    )

    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.PURCHASE_KEY,
      request,
      iframes.data.iframe,
      dataOrigin
    )
  })

  describe('when the Web3ProxyProvider is ready', () => {
    function receiveReadyWeb3() {
      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY_WEB3,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )
    }

    function makeWalletReadyForWeb3() {
      const wallet = makeWallet()
      receiveReadyWeb3()
      return wallet
    }

    function makeWalletWithMockEnable() {
      fakeWindow.makeWeb3()
      const wallet = makeWallet()
      wallet.enableCryptoWallet = jest.fn()
      receiveReadyWeb3()
      return wallet
    }

    function makeWalletWithFailingEnable() {
      fakeWindow.makeWeb3()
      fakeWindow.web3 &&
        (fakeWindow.web3.currentProvider.enable = async () => {
          throw new Error('fail')
        })
      makeWallet()
      receiveReadyWeb3()
    }

    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should reply with noWallet = true if there is no wallet', () => {
      expect.assertions(1)

      makeWalletReadyForWeb3()

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WALLET_INFO,
        {
          noWallet: true,
          notEnabled: false,
          isMetamask: false,
        },
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should call enable', () => {
      expect.assertions(1)

      const wallet = makeWalletWithMockEnable()

      expect(wallet.enableCryptoWallet).toHaveBeenCalled()
    })

    it('should report that the wallet exists and is not enabled if enable fails', async () => {
      expect.assertions(1)

      makeWalletWithFailingEnable()
      await fakeWindow.waitForPostMessageToIframe(iframes.data.iframe)

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WALLET_INFO,
        {
          noWallet: false,
          notEnabled: true,
          isMetamask: false,
        },
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should report that the wallet exists and is enabled if enable succeeds', async () => {
      expect.assertions(1)

      fakeWindow.makeWeb3()
      makeWalletReadyForWeb3()
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
  })

  describe('handling calls to the crypto wallet', () => {
    let web3Callback: (error: string | null, result?: any) => void
    function receiveReadyWeb3() {
      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY_WEB3,
        undefined,
        iframes.data.iframe,
        dataOrigin
      )
    }

    function makeWeb3Wallet() {
      makeWallet()
      receiveReadyWeb3()
    }

    async function makeEnabledWeb3Wallet() {
      fakeWindow.makeWeb3()
      fakeWindow.web3 &&
        (fakeWindow.web3.currentProvider.sendAsync = jest.fn(
          (_, cb: (error: string | null, result?: any) => void) => {
            web3Callback = cb
          }
        ))

      makeWeb3Wallet()
      await fakeWindow.waitForPostMessageToIframe(iframes.data.iframe)
    }

    beforeEach(() => {
      fakeWindow = new FakeWindow()
      ;(web3Callback as any) = undefined
    })

    it('should return an error if there is no wallet', () => {
      expect.assertions(1)

      makeWeb3Wallet()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.WEB3,
        {
          jsonrpc: '2.0',
          id: 142,
          method: 'eth_accounts',
          params: [],
        },
        iframes.data.iframe,
        dataOrigin
      )

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WEB3_RESULT,
        {
          jsonrpc: '2.0',
          id: 142,
          error: 'No web3 wallet is available',
        },
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should return an error if the wallet returns an error', async () => {
      expect.assertions(1)

      await makeEnabledWeb3Wallet()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.WEB3,
        {
          jsonrpc: '2.0',
          id: 142,
          method: 'eth_accounts',
          params: [],
        },
        iframes.data.iframe,
        dataOrigin
      )

      web3Callback('error')

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WEB3_RESULT,
        {
          jsonrpc: '2.0',
          id: 142,
          error: 'error',
        },
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should return a result if the wallet returns a result', async () => {
      expect.assertions(1)

      await makeEnabledWeb3Wallet()

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.WEB3,
        {
          jsonrpc: '2.0',
          id: 142,
          method: 'eth_accounts',
          params: [],
        },
        iframes.data.iframe,
        dataOrigin
      )

      const result = {
        jsonrpc: '2.0',
        id: 142,
        result: 'hi',
      }

      web3Callback(null, result)

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WEB3_RESULT,
        {
          jsonrpc: '2.0',
          id: 142,
          result: {
            jsonrpc: '2.0',
            id: 142,
            result: 'hi',
          },
        },
        iframes.data.iframe,
        dataOrigin
      )
    })
  })
})
