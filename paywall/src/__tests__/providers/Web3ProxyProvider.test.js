import { WalletService } from '@unlock-protocol/unlock-js'
import Web3ProxyProvider from '../../providers/Web3ProxyProvider'
import { PostMessages } from '../../messageTypes'

import { delayPromise, waitFor } from '../../utils/promises'
import FakeWindow from '../test-helpers/fakeWindowHelpers'

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

  it('posts PostMessages.READY on init', () => {
    expect.assertions(1)
    new Web3ProxyProvider(fakeWindow)

    expect(fakeParent.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PostMessages.READY_WEB3,
        payload: undefined,
      }),
      'origin'
    )
  })

  it('throws if the wallet info has not yet been received', async () => {
    expect.assertions(2)
    const provider = new Web3ProxyProvider(fakeWindow)
    provider.waiting = false // fake the receipt of PostMessages.WALLET_INFO
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
    provider.waiting = false // fake the receipt of PostMessages.WALLET_INFO
    const walletService = new WalletService({ unlockAddress })

    fakeEvent(PostMessages.WALLET_INFO, {
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
    provider.waiting = false // fake the receipt of PostMessages.WALLET_INFO
    const walletService = new WalletService({ unlockAddress })

    fakeEvent(PostMessages.WALLET_INFO, {
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

  it('waits for receipt of PostMessages.WALLET_INFO to attempt actions', async done => {
    expect.assertions(2)
    const provider = new Web3ProxyProvider(fakeWindow)
    const walletService = new WalletService({ unlockAddress })

    fakeParent.postMessage = (data, origin) => {
      expect(data).toEqual({
        type: PostMessages.WEB3,
        payload: {
          method: 'net_version',
          params: [],
          id: 1,
        },
      })
      expect(origin).toBe('origin')
      done()
    }
    walletService.connect(provider)

    await delayPromise(100)
    // because this is after the call to connect it will wait until receipt to continue
    fakeEvent(PostMessages.WALLET_INFO, {
      isMetamask: false,
      noWallet: false,
      notEnabled: false,
    })
  })

  it('posts the right message for net_version', async done => {
    expect.assertions(2)
    const provider = new Web3ProxyProvider(fakeWindow)
    const walletService = new WalletService({ unlockAddress })

    fakeEvent(PostMessages.WALLET_INFO, {
      isMetamask: false,
      noWallet: false,
      notEnabled: false,
    })

    fakeParent.postMessage = (data, origin) => {
      expect(data).toEqual({
        type: PostMessages.WEB3,
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
    fakeEvent(PostMessages.WALLET_INFO, {
      isMetamask: false,
      noWallet: false,
      notEnabled: false,
    })

    fakeParent.postMessage = (data, origin) => {
      expect(data).toEqual({
        type: PostMessages.WEB3,
        payload: {
          method: 'net_version',
          params: [],
          id: 1,
        },
      })
      expect(origin).toBe('origin')
      setTimeout(() => {
        fakeEvent(PostMessages.WEB3, {
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
    await waitFor(() => called)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'net_version',
        params: [],
      }),
      expect.any(Function)
    )
  })

  describe('handling result of a call', () => {
    let provider
    let callback

    beforeEach(async () => {
      fakeWindow = new FakeWindow()
      callback = jest.fn()
      provider = new Web3ProxyProvider(fakeWindow)

      fakeWindow.receivePostMessageFromMainWindow(PostMessages.WALLET_INFO, {
        isMetamask: false,
        noWallet: false,
        notEnabled: false,
      })

      provider.sendAsync({ method: 'hi', params: [] }, callback)
    })

    it('should call the callback with a result and no error', async () => {
      expect.assertions(1)

      fakeWindow.receivePostMessageFromMainWindow(PostMessages.WEB3, {
        id: 1,
        jsonrpc: '2.0',
        result: {
          id: 1,
          jsonrpc: '2.0',
          result: 'foo',
        },
      })

      expect(callback).toHaveBeenCalledWith(null, {
        id: 1,
        jsonrpc: '2.0',
        result: 'foo',
      })
    })

    it('should call the callback with an error', async () => {
      expect.assertions(1)

      fakeWindow.receivePostMessageFromMainWindow(PostMessages.WEB3, {
        id: 1,
        jsonrpc: '2.0',
        error: { error: 'no foo for you', code: 501 },
      })

      expect(callback).toHaveBeenCalledWith(
        {
          error: 'no foo for you',
          code: 501,
        },
        undefined
      )
    })

    it('should do nothing if data is missing', async () => {
      expect.assertions(1)

      fakeWindow.receivePostMessageFromMainWindow(PostMessages.WEB3, {
        id: 1,
        jsonrpc: '2.0',
      })

      expect(callback).not.toHaveBeenCalled()
    })
  })
})
