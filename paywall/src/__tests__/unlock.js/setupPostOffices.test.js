import setupPostOffices from '../../unlock.js/setupPostOffices'
import {
  POST_MESSAGE_READY,
  POST_MESSAGE_CONFIG,
  POST_MESSAGE_UNLOCKED,
  POST_MESSAGE_LOCKED,
  POST_MESSAGE_PURCHASE_KEY,
  POST_MESSAGE_UPDATE_NETWORK,
  POST_MESSAGE_UPDATE_ACCOUNT,
  POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
  POST_MESSAGE_UPDATE_LOCKS,
  POST_MESSAGE_WALLET_INFO,
  POST_MESSAGE_ERROR,
  POST_MESSAGE_UPDATE_WALLET,
  POST_MESSAGE_READY_WEB3,
  POST_MESSAGE_SEND_UPDATES,
} from '../../paywall-builder/constants'

describe('setupPostOffice', () => {
  let fakeWindow
  let fakeDataIframe
  let fakeUIIframe

  function sendMessage(source, type, payload) {
    fakeWindow.handlers.message.forEach(handler =>
      handler({
        type: 'message',
        data: { type, payload },
        origin: 'http://paywall',
        source: source.contentWindow,
      })
    )
  }

  beforeEach(() => {
    process.env.PAYWALL_URL = 'http://paywall'
    fakeWindow = {
      document: {
        body: {
          style: {},
        },
      },
      origin: 'http://fun.times',
      web3: {
        currentProvider: {
          send: jest.fn(),
        },
      },
      CustomEvent: window.CustomEvent,
      dispatchEvent: jest.fn(),
      unlockProtocolConfig: {
        config: 'thing',
      },
      handlers: {},
      addEventListener(type, handler) {
        fakeWindow.handlers[type] = fakeWindow.handlers[type] || []
        fakeWindow.handlers[type].push(handler)
      },
      storage: {},
      localStorage: {
        getItem: jest.fn(key => fakeWindow.storage[key]),
        setItem: jest.fn((key, value) => {
          if (typeof value !== 'string') {
            throw new Error('localStorage only supports strings')
          }
          fakeWindow.storage[key] = value
        }),
        removeItem: jest.fn(key => {
          delete fakeWindow.storage[key]
        }),
      },
    }
    fakeDataIframe = {
      contentWindow: {
        Iam: 'data',
        origin: 'http://paywall',
        postMessage: jest.fn(),
      },
    }
    fakeUIIframe = {
      contentWindow: {
        Iam: 'UI',
        origin: 'http://paywall',
        postMessage: jest.fn(),
      },
      className: 'unlock start',
    }
    setupPostOffices(fakeWindow, fakeDataIframe, fakeUIIframe)
  })

  it('should create the unlockProtocol object with "loadCheckoutModal" that shows the iframe', () => {
    expect.assertions(3)

    expect(fakeWindow.unlockProtocol).not.toBeNull()
    expect(fakeUIIframe.className).toBe('unlock start')

    fakeWindow.unlockProtocol.loadCheckoutModal()

    expect(fakeUIIframe.className).toBe('unlock start show')
  })

  it('responds to POST_MESSAGE_READY_WEB3 by sending POST_MESSAGE_WALLET_INFO', () => {
    expect.assertions(2)

    sendMessage(fakeDataIframe, POST_MESSAGE_READY_WEB3, {
      lock: { address: 'lock' },
    })

    expect(fakeUIIframe.contentWindow.postMessage).not.toHaveBeenCalled()
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_WALLET_INFO,
        payload: {
          noWallet: false,
          notEnabled: true,
          isMetamask: false,
        },
      },
      'http://paywall'
    )
  })

  it('responds to POST_MESSAGE_READY by sending the config to both iframes', () => {
    expect.assertions(8)

    sendMessage(fakeDataIframe, POST_MESSAGE_READY)
    sendMessage(fakeUIIframe, POST_MESSAGE_READY)

    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenCalledTimes(5)
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      1,
      {
        type: POST_MESSAGE_CONFIG,
        payload: fakeWindow.unlockProtocolConfig,
      },
      'http://paywall'
    )
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      2,
      {
        type: POST_MESSAGE_SEND_UPDATES,
        payload: 'network',
      },
      'http://paywall'
    )
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      3,
      {
        type: POST_MESSAGE_SEND_UPDATES,
        payload: 'account',
      },
      'http://paywall'
    )
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      4,
      {
        type: POST_MESSAGE_SEND_UPDATES,
        payload: 'balance',
      },
      'http://paywall'
    )
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      5,
      {
        type: POST_MESSAGE_SEND_UPDATES,
        payload: 'locks',
      },
      'http://paywall'
    )

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledTimes(1)
    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_CONFIG,
        payload: fakeWindow.unlockProtocolConfig,
      },
      'http://paywall'
    )
  })

  it('responds to POST_MESSAGE_UNLOCKED by sending unlocked to the UI iframe', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_UNLOCKED, ['lock'])

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_UNLOCKED,
        payload: ['lock'],
      },
      'http://paywall'
    )
  })

  it('responds to POST_MESSAGE_UNLOCKED by dispatching unlockProtocol event', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_UNLOCKED, ['lock'])

    expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'unlockProtocol',
        detail: 'unlocked',
      })
    )
  })

  it('responds to POST_MESSAGE_UNLOCKED by storing in localStorage for quick recovery on next visit', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_UNLOCKED, ['lock'])

    expect(fakeWindow.storage).toEqual({
      '__unlockProtocol.locked': 'false',
    })
  })

  it('responds to POST_MESSAGE_UNLOCKED by not hiding the checkout UI if the key is not confirmed', () => {
    expect.assertions(1)

    fakeUIIframe.className = 'unlock start show'

    sendMessage(fakeDataIframe, POST_MESSAGE_UNLOCKED, ['lock'])

    expect(fakeUIIframe.className).toBe('unlock start show')
  })

  it('responds to POST_MESSAGE_UNLOCKED by hiding the checkout UI if the key is confirmed', () => {
    expect.assertions(1)

    fakeUIIframe.className = 'unlock start show'

    sendMessage(fakeDataIframe, POST_MESSAGE_UPDATE_LOCKS, {
      lock: {
        key: {
          status: 'valid',
        },
      },
    })
    sendMessage(fakeDataIframe, POST_MESSAGE_UNLOCKED, ['lock'])

    expect(fakeUIIframe.className).toBe('unlock start')
  })

  it('responds to POST_MESSAGE_LOCKED by sending locked to the UI iframe', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_LOCKED)

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_LOCKED,
        payload: undefined,
      },
      'http://paywall'
    )
  })

  it('responds to POST_MESSAGE_LOCKED by dispatching unlockProtocol event', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_LOCKED)

    expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'unlockProtocol',
        detail: 'locked',
      })
    )
  })

  it('responds to POST_MESSAGE_LOCKED by storing in localStorage for quick recovery on next visit', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_LOCKED, ['lock'])

    expect(fakeWindow.storage).toEqual({
      '__unlockProtocol.locked': 'true',
    })
  })

  it('responds to POST_MESSAGE_ERROR by sending error messages to the UI iframe', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_ERROR, 'fail')

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_ERROR,
        payload: 'fail',
      },
      'http://paywall'
    )
  })

  it('responds to POST_MESSAGE_UPDATE_WALLET by sending modal info to the UI iframe', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_UPDATE_WALLET, true)

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_UPDATE_WALLET,
        payload: true,
      },
      'http://paywall'
    )
  })

  it('relays POST_MESSAGE_PURCHASE_KEY to the data iframe', () => {
    expect.assertions(1)

    sendMessage(fakeUIIframe, POST_MESSAGE_PURCHASE_KEY, {
      lock: 'lock',
      extraTip: '0',
    })

    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_PURCHASE_KEY,
        payload: { lock: 'lock', extraTip: '0' },
      },
      'http://paywall'
    )
  })

  it('relays POST_MESSAGE_UPDATE_NETWORK to the checkout UI', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_UPDATE_NETWORK, 2)

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_UPDATE_NETWORK,
        payload: 2,
      },
      'http://paywall'
    )
  })

  it('relays POST_MESSAGE_UPDATE_ACCOUNT to the checkout UI', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_UPDATE_ACCOUNT, 'account')

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_UPDATE_ACCOUNT,
        payload: 'account',
      },
      'http://paywall'
    )
  })

  it('relays POST_MESSAGE_UPDATE_ACCOUNT_BALANCE to the checkout UI', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_UPDATE_ACCOUNT_BALANCE, '1')

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
        payload: '1',
      },
      'http://paywall'
    )
  })

  it('relays POST_MESSAGE_UPDATE_LOCKS to the checkout UI', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, POST_MESSAGE_UPDATE_LOCKS, {
      lock: { address: 'lock' },
    })

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: POST_MESSAGE_UPDATE_LOCKS,
        payload: {
          lock: { address: 'lock' },
        },
      },
      'http://paywall'
    )
  })
})
