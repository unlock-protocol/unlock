import { _clearHandlers, iframePostOffice } from '../../utils/postOffice'
import setupPostOfficeListener from '../../data-iframe/postOfficeListener'
import {
  POST_MESSAGE_READY,
  POST_MESSAGE_DATA_REQUEST,
} from '../../paywall-builder/constants'

describe('postOffice listener', () => {
  let fakeWindow
  let fakeTarget
  let fakeUpdater

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

  beforeEach(() => {
    fakeTarget = {
      postMessage: jest.fn(),
    }
    fakeUpdater = jest.fn()

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

  it('responds to ready message by calling updater for all the data', () => {
    expect.assertions(5)

    setupPostOfficeListener(fakeWindow, fakeUpdater)

    callListener(POST_MESSAGE_READY, undefined)

    expect(fakeUpdater).toHaveBeenCalledTimes(4)
    expect(fakeUpdater).toHaveBeenNthCalledWith(1, 'network')
    expect(fakeUpdater).toHaveBeenNthCalledWith(2, 'account')
    expect(fakeUpdater).toHaveBeenNthCalledWith(3, 'balance')
    expect(fakeUpdater).toHaveBeenNthCalledWith(4, 'locks')
  })

  it('responds to a data request message "locks" by calling updater with "locks"', () => {
    expect.assertions(2)

    setupPostOfficeListener(fakeWindow, fakeUpdater)

    callListener(POST_MESSAGE_DATA_REQUEST, 'locks')

    expect(fakeUpdater).toHaveBeenCalledTimes(1)
    expect(fakeUpdater).toHaveBeenCalledWith('locks')
  })

  it('responds to a data request message "account" by calling updater with "account"', () => {
    expect.assertions(2)

    setupPostOfficeListener(fakeWindow, fakeUpdater)

    callListener(POST_MESSAGE_DATA_REQUEST, 'account')

    expect(fakeUpdater).toHaveBeenCalledTimes(1)
    expect(fakeUpdater).toHaveBeenCalledWith('account')
  })

  it('responds to a data request message "balance" by calling updater with "balance"', () => {
    expect.assertions(2)

    setupPostOfficeListener(fakeWindow, fakeUpdater)

    callListener(POST_MESSAGE_DATA_REQUEST, 'balance')

    expect(fakeUpdater).toHaveBeenCalledTimes(1)
    expect(fakeUpdater).toHaveBeenCalledWith('balance')
  })

  it('responds to a data request message "network" by calling updater with "network"', () => {
    expect.assertions(2)

    setupPostOfficeListener(fakeWindow, fakeUpdater)

    callListener(POST_MESSAGE_DATA_REQUEST, 'network')

    expect(fakeUpdater).toHaveBeenCalledTimes(1)
    expect(fakeUpdater).toHaveBeenCalledWith('network')
  })

  it('responds to a malicious data request by logging and bailing', () => {
    expect.assertions(2)

    setupPostOfficeListener(fakeWindow, fakeUpdater)

    callListener(POST_MESSAGE_DATA_REQUEST, { try: 'to crash us and fail' })

    expect(fakeWindow.console.error).toHaveBeenCalledWith(
      'ignoring malformed data'
    )
    expect(fakeUpdater).not.toHaveBeenCalled()
  })

  it('responds to a misspelled data request by logging and bailing', () => {
    expect.assertions(2)

    setupPostOfficeListener(fakeWindow, fakeUpdater)

    callListener(POST_MESSAGE_DATA_REQUEST, 'nitwerk')

    expect(fakeWindow.console.error).toHaveBeenCalledWith(
      'Unknown data type "nitwerk" requested, ignoring'
    )
    expect(fakeUpdater).not.toHaveBeenCalled()
  })
})
