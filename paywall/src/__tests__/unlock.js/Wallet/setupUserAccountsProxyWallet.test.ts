import { web3MethodCall } from 'src/windowTypes'
import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import { PostMessages } from '../../../messageTypes'
import { setupUserAccountsProxyWallet } from '../../../unlock.js/postMessageHub'
import { unlockNetworks } from '../../../data-iframe/blockchainHandler/blockChainTypes'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'

describe('setupUserAccountsProxyWallet()', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const userIframeUrl = 'http://app/accounts'
  const dataOrigin = 'http://paywall'
  const fakeAddress = '0x1234567890123456789012345678901234567890'
  const config: PaywallConfig = {
    locks: {},
    callToAction: {
      default: '',
      pending: '',
      confirmed: '',
      expired: '',
      noWallet: '',
    },
    unlockUserAccounts: true,
  }

  let setHasWeb3 = jest.fn()
  let getUserAccountAddress: jest.Mock<string | null, []> = jest.fn(
    () => fakeAddress
  )
  let getUserAccountNetwork = jest.fn((): unlockNetworks => 1)

  beforeAll(() => {
    fakeWindow = new FakeWindow()
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )

    // setupUserAccountsProxyWallet depends on the initial setup having already been done
    // these tests don't rely on the constants param
    new MainWindowHandler(fakeWindow, iframes, config, {} as any)

    setupUserAccountsProxyWallet({
      iframes,
      setHasWeb3,
      getUserAccountAddress,
      getUserAccountNetwork,
    })
  })

  it('should indicate that the wallet exists', () => {
    expect.assertions(1)

    expect(setHasWeb3).toHaveBeenCalledWith(true)
  })

  it('should handle READY from accounts iframe', () => {
    expect.assertions(2)

    iframes.accounts.postMessage = jest.fn()
    iframes.accounts.emit(PostMessages.READY)

    // We should ask what the account address is
    expect(iframes.accounts.postMessage).toHaveBeenCalledWith(
      PostMessages.SEND_UPDATES,
      'account'
    )

    // We should ask which network we're on
    expect(iframes.accounts.postMessage).toHaveBeenCalledWith(
      PostMessages.SEND_UPDATES,
      'network'
    )
  })

  it('should handle PURCHASE_KEY from checkout iframe', () => {
    expect.assertions(1)

    const request = {
      lock: '0xdeadb33f',
      extraTip: '0',
    }

    iframes.checkout.emit(PostMessages.PURCHASE_KEY, request)

    expect(iframes.accounts.postMessage).toHaveBeenCalledWith(
      PostMessages.PURCHASE_KEY,
      request
    )
  })

  it('should handle READY_WEB3 from the data iframe', () => {
    expect.assertions(1)

    iframes.data.emit(PostMessages.READY_WEB3)

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

  describe('WEB3 from data iframe', () => {
    const methodCall = (method: string, ...params: any[]): web3MethodCall => ({
      method,
      params,
      jsonrpc: '2.0',
      id: 7,
    })

    it('should respond with the account address for "eth_accounts"', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.WEB3, methodCall('eth_accounts'))

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WEB3_RESULT,
        expect.objectContaining({
          result: expect.objectContaining({
            result: [fakeAddress],
          }),
        }),
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should respond with the network for "net_version"', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.WEB3, methodCall('net_version'))

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WEB3_RESULT,
        expect.objectContaining({
          result: expect.objectContaining({
            result: 1,
          }),
        }),
        iframes.data.iframe,
        dataOrigin
      )
    })

    it('should give an error on any other method', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.WEB3, methodCall('xyzzy'))

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.WEB3_RESULT,
        {
          id: 7,
          jsonrpc: '2.0',
          error: '"xyzzy" is not supported',
        },
        iframes.data.iframe,
        dataOrigin
      )
    })
  })
})
