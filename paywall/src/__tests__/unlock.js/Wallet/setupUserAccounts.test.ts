import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig, Locks } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import { PostMessages } from '../../../messageTypes'
import { setupUserAccounts } from '../../../unlock.js/postMessageHub'

describe('setupUserAccounts()', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  const dataIframeUrl = 'http://paywall/data'
  const checkoutIframeUrl = 'http://paywall/checkout'
  const userIframeUrl = 'http://app/accounts'
  const dataOrigin = 'http://paywall'
  const accountsOrigin = 'http://app'
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

  let setUserAccountAddress = jest.fn()
  let setUserAccountNetwork = jest.fn()
  let createIframeSpy: any

  beforeAll(() => {
    fakeWindow = new FakeWindow()
    iframes = new IframeHandler(
      fakeWindow,
      dataIframeUrl,
      checkoutIframeUrl,
      userIframeUrl
    )
    createIframeSpy = jest.spyOn(iframes.accounts, 'createIframe')
    setupUserAccounts({
      iframes,
      config,
      setUserAccountAddress,
      setUserAccountNetwork,
    })
  })

  it('should create the accounts iframe', () => {
    expect.assertions(1)

    expect(createIframeSpy).toHaveBeenCalled()
  })

  it('should handle READY from the accounts iframe', () => {
    expect.assertions(2)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.READY,
      undefined,
      iframes.accounts.iframe,
      accountsOrigin
    )

    // First main window should send config to accounts iframe
    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.CONFIG,
      config,
      iframes.accounts.iframe,
      accountsOrigin
    )

    // Then it should ask the data iframe to send lock updates
    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.SEND_UPDATES,
      'locks',
      iframes.data.iframe,
      dataOrigin
    )
  })

  it('should handle UPDATE_LOCKS from the data iframe', () => {
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

    iframes.data.emit(PostMessages.UPDATE_LOCKS, locks)

    // We handle this data by passing it through to the account iframe
    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.UPDATE_LOCKS,
      locks,
      iframes.accounts.iframe,
      accountsOrigin
    )
  })

  it('should handle UPDATE_ACCOUNT from the accounts iframe', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.UPDATE_ACCOUNT,
      fakeAddress,
      iframes.accounts.iframe,
      accountsOrigin
    )

    // setUserAccountAddress updates the internal state of the wallet
    expect(setUserAccountAddress).toHaveBeenCalledWith(fakeAddress)
  })

  it('should handle UPDATE_NETWORK from the accounts iframe', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.UPDATE_NETWORK,
      1,
      iframes.accounts.iframe,
      accountsOrigin
    )

    // setUserAccountNetwork updates the internal state of the wallet
    expect(setUserAccountNetwork).toHaveBeenCalledWith(1)
  })

  it('should handle INITIATED_TRANSACTION from accounts iframe', () => {
    expect.assertions(1)

    fakeWindow.receivePostMessageFromIframe(
      PostMessages.INITIATED_TRANSACTION,
      undefined,
      iframes.accounts.iframe,
      accountsOrigin
    )

    // Let the data iframe know that a managed purchase has begun
    fakeWindow.expectPostMessageSentToIframe(
      PostMessages.INITIATED_TRANSACTION,
      undefined,
      iframes.data.iframe,
      dataOrigin
    )
  })
})
