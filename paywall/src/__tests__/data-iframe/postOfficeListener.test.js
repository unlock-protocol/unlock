import { _clearHandlers, iframePostOffice } from '../../utils/postOffice'
import setupPostOfficeListener from '../../data-iframe/postOfficeListener'
import {
  POST_MESSAGE_DATA_REQUEST,
  POST_MESSAGE_CONFIG,
  POST_MESSAGE_PURCHASE_KEY,
} from '../../paywall-builder/constants'

describe('postOffice listener', () => {
  let fakeWindow
  let fakeTarget
  let fakeUpdater
  let fakeSetConfig
  let fakePurchase

  function callListener(type, payload) {
    fakeWindow.handlers.message({
      source: fakeTarget,
      data: {
        type,
        payload,
      },
      origin: 'http://fun.times',
    })
  }

  function makePostOffice() {
    setupPostOfficeListener(
      fakeWindow,
      fakeUpdater,
      fakeSetConfig,
      fakePurchase
    )
  }

  beforeEach(() => {
    fakeTarget = {
      postMessage: jest.fn(),
    }
    fakeUpdater = jest.fn()
    fakeSetConfig = jest.fn()
    fakePurchase = jest.fn()

    fakeWindow = {
      console: {
        error: jest.fn(),
      },
      parent: fakeTarget,
      location: {
        href: 'http://example.com?origin=http%3A%2F%2Ffun.times',
      },
      handlers: {},
      addEventListener(type, handler) {
        fakeWindow.handlers[type] = handler
      },
    }
    _clearHandlers()
    iframePostOffice(fakeWindow)
  })

  it('responds to config message by calling setConfig when the config is valid', () => {
    expect.assertions(2)

    makePostOffice()
    const validConfig = {
      locks: {
        '0x1234567890123456789012345678901234567890': {
          name: 'hi',
        },
        '0x0987654321098765432109876543210987654321': {
          name: 'bye',
        },
      },
      icon: false,
      callToAction: {
        default:
          'You have reached your limit of free articles. Please purchase access',
        expired:
          'Your subscription has expired, please purchase a new key to continue',
        pending: 'Purchase pending...',
        confirmed: 'Purchase confirmed, content unlocked!',
      },
    }

    callListener(POST_MESSAGE_CONFIG, {
      not: 'a valid config',
    })
    callListener(POST_MESSAGE_CONFIG, validConfig)

    expect(fakeSetConfig).toHaveBeenCalledTimes(1)
    expect(fakeSetConfig).toHaveBeenCalledWith(validConfig)
  })

  it('responds to a data request message "locks" by calling updater with "locks"', () => {
    expect.assertions(2)

    makePostOffice()

    callListener(POST_MESSAGE_DATA_REQUEST, 'locks')

    expect(fakeUpdater).toHaveBeenCalledTimes(1)
    expect(fakeUpdater).toHaveBeenCalledWith('locks')
  })

  it('responds to a data request message "account" by calling updater with "account"', () => {
    expect.assertions(2)

    makePostOffice()

    callListener(POST_MESSAGE_DATA_REQUEST, 'account')

    expect(fakeUpdater).toHaveBeenCalledTimes(1)
    expect(fakeUpdater).toHaveBeenCalledWith('account')
  })

  it('responds to a data request message "balance" by calling updater with "balance"', () => {
    expect.assertions(2)

    makePostOffice()

    callListener(POST_MESSAGE_DATA_REQUEST, 'balance')

    expect(fakeUpdater).toHaveBeenCalledTimes(1)
    expect(fakeUpdater).toHaveBeenCalledWith('balance')
  })

  it('responds to a data request message "network" by calling updater with "network"', () => {
    expect.assertions(2)

    makePostOffice()

    callListener(POST_MESSAGE_DATA_REQUEST, 'network')

    expect(fakeUpdater).toHaveBeenCalledTimes(1)
    expect(fakeUpdater).toHaveBeenCalledWith('network')
  })

  it('responds to a malicious data request by logging and bailing', () => {
    expect.assertions(2)

    makePostOffice()

    callListener(POST_MESSAGE_DATA_REQUEST, { try: 'to crash us and fail' })

    expect(fakeWindow.console.error).toHaveBeenCalledWith(
      'ignoring malformed data'
    )
    expect(fakeUpdater).not.toHaveBeenCalled()
  })

  it('responds to a misspelled data request by logging and bailing', () => {
    expect.assertions(2)

    makePostOffice()

    callListener(POST_MESSAGE_DATA_REQUEST, 'nitwerk')

    expect(fakeWindow.console.error).toHaveBeenCalledWith(
      'Unknown data type "nitwerk" requested, ignoring'
    )
    expect(fakeUpdater).not.toHaveBeenCalled()
  })

  it('responds to a purchase request by passing the lock and extra tip beyond key price (if any) to purchase', () => {
    expect.assertions(3)

    makePostOffice()

    const lock = '0x1234567890123456789012345678901234567890'
    callListener(POST_MESSAGE_PURCHASE_KEY, { lock })
    callListener(POST_MESSAGE_PURCHASE_KEY, { lock, extraTip: '1' })

    expect(fakePurchase).toHaveBeenCalledTimes(2)
    expect(fakePurchase).toHaveBeenNthCalledWith(1, lock, undefined)
    expect(fakePurchase).toHaveBeenNthCalledWith(2, lock, '1')
  })

  it('responds to a malformed purchase request by logging and bailing', () => {
    expect.assertions(7)

    makePostOffice()

    const lock = '0x1234567890123456789012345678901234567890'
    callListener(POST_MESSAGE_PURCHASE_KEY, false)
    callListener(POST_MESSAGE_PURCHASE_KEY, [])
    callListener(POST_MESSAGE_PURCHASE_KEY, { lock: [] })
    callListener(POST_MESSAGE_PURCHASE_KEY, { lock, extraTip: [] })
    callListener(POST_MESSAGE_PURCHASE_KEY, { lock, extraTip: 'a' })
    callListener(POST_MESSAGE_PURCHASE_KEY, {
      lock: '0xtooshort',
      extraTip: '123',
    })

    expect(fakeWindow.console.error).toHaveBeenNthCalledWith(
      1,
      'ignoring malformed purchase request'
    )
    expect(fakeWindow.console.error).toHaveBeenNthCalledWith(
      2,
      'ignoring malformed purchase request'
    )
    expect(fakeWindow.console.error).toHaveBeenNthCalledWith(
      3,
      'ignoring malformed purchase request'
    )
    expect(fakeWindow.console.error).toHaveBeenNthCalledWith(
      4,
      'ignoring malformed purchase request'
    )
    expect(fakeWindow.console.error).toHaveBeenNthCalledWith(
      5,
      'ignoring malformed purchase request'
    )
    expect(fakeWindow.console.error).toHaveBeenNthCalledWith(
      6,
      'ignoring malformed purchase request'
    )
    expect(fakePurchase).not.toHaveBeenCalled()
  })
})
