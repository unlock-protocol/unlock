import { WalletService } from '@unlock-protocol/unlock-js'
import Web3ProxyProvider from '../../providers/Web3ProxyProvider'
import {
  POST_MESSAGE_READY,
  POST_MESSAGE_WALLET_INFO,
  POST_MESSAGE_WEB3,
} from '../../paywall-builder/constants'

describe('Web3ProxyProvider', () => {
  let fakeWindow
  let fakeParent
  const unlockAddress = '0x1234567890123456789012345678901234567890'

  function fakeEvent(type, payload) {
    fakeWindow.handlers.message({
      source: fakeParent,
      origin: 'origin',
      data: {
        type,
        payload,
      },
    })
  }
  beforeEach(() => {
    fakeParent = {
      postMessage: jest.fn(),
    }

    fakeWindow = {
      location: {
        href: 'http://localhost?origin=origin',
      },
      parent: fakeParent,
      handlers: {},
      addEventListener: (type, handler) => {
        fakeWindow.handlers[type] = handler
      },
    }
  })

  it('posts POST_MESSAGE_READY on init', () => {
    expect.assertions(1)
    new Web3ProxyProvider(fakeWindow)

    expect(fakeParent.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: POST_MESSAGE_READY,
        payload: undefined,
      }),
      'origin'
    )
  })

  it('throws if the wallet info has not yet been received', async () => {
    expect.assertions(2)
    const provider = new Web3ProxyProvider(fakeWindow)
    const walletService = new WalletService({ unlockAddress })

    try {
      await walletService.connect(provider)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('no ethereum wallet is available')
    }
  })

  it('throws if the wallet info says we have no wallet', async () => {
    expect.assertions(2)
    const provider = new Web3ProxyProvider(fakeWindow)
    const walletService = new WalletService({ unlockAddress })

    fakeEvent(POST_MESSAGE_WALLET_INFO, {
      isMetamask: false,
      noWallet: true,
      notEnabled: false,
    })
    try {
      await walletService.connect(provider)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('no ethereum wallet is available')
    }
  })

  it('throws if the wallet info says we rejected being enabled', async () => {
    expect.assertions(2)
    const provider = new Web3ProxyProvider(fakeWindow)
    const walletService = new WalletService({ unlockAddress })

    fakeEvent(POST_MESSAGE_WALLET_INFO, {
      isMetamask: false,
      noWallet: false,
      notEnabled: true,
    })
    try {
      await walletService.connect(provider)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('user declined to enable the ethereum wallet')
    }
  })

  it('posts the right message for net_version', async done => {
    expect.assertions(2)
    const provider = new Web3ProxyProvider(fakeWindow)
    const walletService = new WalletService({ unlockAddress })

    fakeEvent(POST_MESSAGE_WALLET_INFO, {
      isMetamask: false,
      noWallet: false,
      notEnabled: false,
    })

    fakeParent.postMessage = (data, origin) => {
      expect(data).toEqual({
        type: POST_MESSAGE_WEB3,
        payload: {
          method: 'net_version',
          params: [],
          id: 1,
        },
      })
      expect(origin).toBe('origin')
      done()
    }
    await walletService.connect(provider)
  })

  it('returns the right values', async () => {
    expect.assertions(4)
    const provider = new Web3ProxyProvider(fakeWindow)
    const spy = jest.spyOn(provider, 'sendAsync')
    const walletService = new WalletService({ unlockAddress })

    let called = false
    fakeEvent(POST_MESSAGE_WALLET_INFO, {
      isMetamask: false,
      noWallet: false,
      notEnabled: false,
    })

    fakeParent.postMessage = (data, origin) => {
      expect(data).toEqual({
        type: POST_MESSAGE_WEB3,
        payload: {
          method: 'net_version',
          params: [],
          id: 1,
        },
      })
      expect(origin).toBe('origin')
      setTimeout(() => {
        fakeEvent(POST_MESSAGE_WEB3, {
          error: null,
          result: {
            id: 1,
            jsonrpc: '2.0',
            result: '1',
          },
        })
        setTimeout(() => (called = true))
      })
    }
    walletService.connect(provider)

    // resolve when the spy has been called
    // if we await on the connect call, it may hang
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (called) {
          clearInterval(interval)
          resolve()
        }
      })
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'net_version',
        params: [],
      }),
      expect.any(Function)
    )
  })
})
