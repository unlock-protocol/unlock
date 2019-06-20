import setupPostOffices from '../../unlock.js/setupPostOffices'
import { PostMessages } from '../../messageTypes'

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

  it('responds to PostMessages.READY_WEB3 by sending PostMessages.WALLET_INFO', () => {
    expect.assertions(2)

    sendMessage(fakeDataIframe, PostMessages.READY_WEB3, {
      lock: { address: 'lock' },
    })

    expect(fakeUIIframe.contentWindow.postMessage).not.toHaveBeenCalled()
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.WALLET_INFO,
        payload: {
          noWallet: false,
          notEnabled: true,
          isMetamask: false,
        },
      },
      'http://paywall'
    )
  })

  it('responds to PostMessages.READY by sending the config to both iframes', () => {
    expect.assertions(8)

    sendMessage(fakeDataIframe, PostMessages.READY)
    sendMessage(fakeUIIframe, PostMessages.READY)

    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenCalledTimes(5)
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      1,
      {
        type: PostMessages.CONFIG,
        payload: fakeWindow.unlockProtocolConfig,
      },
      'http://paywall'
    )
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      2,
      {
        type: PostMessages.SEND_UPDATES,
        payload: 'network',
      },
      'http://paywall'
    )
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      3,
      {
        type: PostMessages.SEND_UPDATES,
        payload: 'account',
      },
      'http://paywall'
    )
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      4,
      {
        type: PostMessages.SEND_UPDATES,
        payload: 'balance',
      },
      'http://paywall'
    )
    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
      5,
      {
        type: PostMessages.SEND_UPDATES,
        payload: 'locks',
      },
      'http://paywall'
    )

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledTimes(1)
    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.CONFIG,
        payload: fakeWindow.unlockProtocolConfig,
      },
      'http://paywall'
    )
  })

  it('responds to PostMessages.READY by showing the checkout UI if the paywall type is "paywall"', () => {
    expect.assertions(1)

    fakeWindow.unlockProtocolConfig = {
      type: 'paywall',
    }

    sendMessage(fakeUIIframe, PostMessages.READY)

    expect(fakeUIIframe.className).toBe('unlock start show')
  })

  it('responds to PostMessages.UNLOCKED by sending unlocked to the UI iframe', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.UNLOCKED, ['lock'])

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.UNLOCKED,
        payload: ['lock'],
      },
      'http://paywall'
    )
  })

  it('responds to PostMessages.UNLOCKED by dispatching unlockProtocol event', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.UNLOCKED, ['lock'])

    expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'unlockProtocol',
        detail: 'unlocked',
      })
    )
  })

  it('responds to PostMessages.UNLOCKED by storing in localStorage for quick recovery on next visit', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.UNLOCKED, ['lock'])

    expect(fakeWindow.storage).toEqual({
      '__unlockProtocol.locked': 'false',
    })
  })

  it('responds to PostMessages.UNLOCKED by not hiding the checkout UI if the key is not confirmed', () => {
    expect.assertions(1)

    fakeUIIframe.className = 'unlock start show'

    sendMessage(fakeDataIframe, PostMessages.UNLOCKED, ['lock'])

    expect(fakeUIIframe.className).toBe('unlock start show')
  })

  it('responds to PostMessages.LOCKED by sending locked to the UI iframe', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.LOCKED)

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.LOCKED,
        payload: undefined,
      },
      'http://paywall'
    )
  })

  it('responds to PostMessages.LOCKED by dispatching unlockProtocol event', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.LOCKED)

    expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'unlockProtocol',
        detail: 'locked',
      })
    )
  })

  it('responds to PostMessages.LOCKED by storing in localStorage for quick recovery on next visit', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.LOCKED, ['lock'])

    expect(fakeWindow.storage).toEqual({
      '__unlockProtocol.locked': 'true',
    })
  })

  it('responds to PostMessages.ERROR by sending error messages to the UI iframe', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.ERROR, 'fail')

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.ERROR,
        payload: 'fail',
      },
      'http://paywall'
    )
  })

  it('responds to PostMessages.UPDATE_WALLET by sending modal info to the UI iframe', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.UPDATE_WALLET, true)

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.UPDATE_WALLET,
        payload: true,
      },
      'http://paywall'
    )
  })

  it('relays PostMessages.PURCHASE_KEY to the data iframe', () => {
    expect.assertions(1)

    sendMessage(fakeUIIframe, PostMessages.PURCHASE_KEY, {
      lock: 'lock',
      extraTip: '0',
    })

    expect(fakeDataIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.PURCHASE_KEY,
        payload: { lock: 'lock', extraTip: '0' },
      },
      'http://paywall'
    )
  })

  it('relays PostMessages.UPDATE_NETWORK to the checkout UI', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.UPDATE_NETWORK, 2)

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.UPDATE_NETWORK,
        payload: 2,
      },
      'http://paywall'
    )
  })

  it('relays PostMessages.UPDATE_ACCOUNT to the checkout UI', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.UPDATE_ACCOUNT, 'account')

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.UPDATE_ACCOUNT,
        payload: 'account',
      },
      'http://paywall'
    )
  })

  it('relays PostMessages.UPDATE_ACCOUNT_BALANCE to the checkout UI', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.UPDATE_ACCOUNT_BALANCE, '1')

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.UPDATE_ACCOUNT_BALANCE,
        payload: '1',
      },
      'http://paywall'
    )
  })

  it('relays PostMessages.UPDATE_LOCKS to the checkout UI', () => {
    expect.assertions(1)

    sendMessage(fakeDataIframe, PostMessages.UPDATE_LOCKS, {
      lock: { address: 'lock' },
    })

    expect(fakeUIIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PostMessages.UPDATE_LOCKS,
        payload: {
          lock: { address: 'lock' },
        },
      },
      'http://paywall'
    )
  })
})
