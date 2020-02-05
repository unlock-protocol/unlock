import { EventEmitter } from 'events'
import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PurchaseKeyRequest } from '../../../unlockTypes'
import { PostMessages } from '../../../messageTypes'
import { setupWeb3ProxyWallet } from '../../../unlock.js/postMessageHub'

// This is a very bare mock class that implements the most basic
// functionality of the iframe handler wrappers: emitting events and
// "sending postMessages"
class EmitterWithPostMessage extends EventEmitter {
  postMessage = jest.fn()
}

describe('setupWeb3ProxyWallet()', () => {
  const fakeAddress = '0x1234567890123456789012345678901234567890'

  function init({
    hasWallet,
    setHasWeb3,
    getHasWeb3,
    isMetamask,
    window,
  }: any) {
    const fakeWindow = new FakeWindow()
    fakeWindow.makeWeb3()
    const iframes = {
      checkout: new EmitterWithPostMessage(),
      data: new EmitterWithPostMessage(),
    }
    setupWeb3ProxyWallet({
      iframes: iframes as any,
      hasWallet: typeof hasWallet === 'undefined' ? true : hasWallet,
      setHasWeb3: setHasWeb3 || jest.fn(),
      getHasWeb3: getHasWeb3 || jest.fn(() => true),
      isMetaMask: isMetamask || true,
      window: window || fakeWindow,
    })

    return {
      iframes,
      window: fakeWindow,
    }
  }

  it('should forward purchase requests to the data iframe', () => {
    expect.assertions(1)

    const { iframes } = init({})

    const request: PurchaseKeyRequest = {
      lock: fakeAddress,
      extraTip: '0',
    }

    iframes.checkout.emit(PostMessages.PURCHASE_KEY, request)

    expect(iframes.data.postMessage).toHaveBeenCalledWith(
      PostMessages.PURCHASE_KEY,
      request
    )
  })

  describe('READY_WEB3', () => {
    it('should send WALLET_INFO indicating no crypto wallet is present', () => {
      expect.assertions(2)

      const hasWallet = false
      const setHasWeb3 = jest.fn()

      const { iframes } = init({
        hasWallet,
        setHasWeb3,
      })

      iframes.data.emit(PostMessages.READY_WEB3)

      expect(setHasWeb3).toHaveBeenCalledWith(false)
      expect(iframes.data.postMessage).toHaveBeenCalledWith(
        PostMessages.WALLET_INFO,
        {
          noWallet: true,
          notEnabled: false,
          isMetaMask: false,
        }
      )
    })

    it('should send WALLET_INFO indicating there is a crypto wallet and has been enabled', done => {
      expect.assertions(2)

      const setHasWeb3 = jest.fn()

      const { iframes } = init({
        setHasWeb3,
      })

      iframes.data.postMessage = jest.fn(() => {
        expect(iframes.data.postMessage).toHaveBeenCalledWith(
          PostMessages.WALLET_INFO,
          {
            noWallet: false,
            notEnabled: false,
            isMetaMask: true,
          }
        )
        done()
      })
      iframes.data.emit(PostMessages.READY_WEB3)

      expect(setHasWeb3).toHaveBeenCalledWith(true)
    })

    it('should send WALLET_INFO indicating the user declined to enable their wallet', done => {
      expect.assertions(2)

      const setHasWeb3 = jest.fn()
      const window = {
        web3: {
          currentProvider: {
            enable: async () => {
              /* eslint-disable-next-line promise/param-names */
              return new Promise((_, reject) => {
                return reject('user did not enable')
              })
            },
          },
        },
      }

      const { iframes } = init({
        setHasWeb3,
        window: window as any,
      })

      iframes.data.postMessage = jest.fn(() => {
        expect(iframes.data.postMessage).toHaveBeenCalledWith(
          PostMessages.WALLET_INFO,
          {
            noWallet: false,
            notEnabled: true,
            isMetaMask: true,
          }
        )
        done()
      })
      iframes.data.emit(PostMessages.READY_WEB3)

      expect(setHasWeb3).toHaveBeenCalledWith(true)
    })
  })

  describe('WEB3', () => {
    const payload = {
      method: 'eth_accounts',
      params: [],
      id: 7,
    }

    it('should send WEB3_RESULT indicating there is no web3 wallet available', () => {
      expect.assertions(1)

      const getHasWeb3 = jest.fn(() => false)
      const { iframes } = init({ getHasWeb3 })

      iframes.data.emit(PostMessages.WEB3, payload)

      expect(iframes.data.postMessage).toHaveBeenCalledWith(
        PostMessages.WEB3_RESULT,
        expect.objectContaining({
          error: 'No web3 wallet is available',
        })
      )
    })

    it('should send a successful WEB3_RESULT using sendAsync', () => {
      expect.assertions(1)

      const window = {
        web3: {
          currentProvider: {
            sendAsync: {
              call: (_web3: any, _method: any, callback: any) => {
                callback(null, 'this is the result of the call')
              },
            },
          },
        },
      }
      const { iframes } = init({ window: window as any })

      iframes.data.emit(PostMessages.WEB3, payload)
      expect(iframes.data.postMessage).toHaveBeenCalledWith(
        PostMessages.WEB3_RESULT,
        expect.objectContaining({
          result: 'this is the result of the call',
        })
      )
    })

    it('should send a successful WEB3_RESULT using send', () => {
      expect.assertions(1)

      const window = {
        web3: {
          currentProvider: {
            send: {
              call: (_web3: any, _method: any, callback: any) => {
                callback(null, 'this is the result of the call')
              },
            },
          },
        },
      }
      const { iframes } = init({ window: window as any })

      iframes.data.emit(PostMessages.WEB3, payload)
      expect(iframes.data.postMessage).toHaveBeenCalledWith(
        PostMessages.WEB3_RESULT,
        expect.objectContaining({
          result: 'this is the result of the call',
        })
      )
    })

    it('should send an error WEB3_RESULT using send', () => {
      expect.assertions(1)

      const error = new Error('it failed')

      const window = {
        web3: {
          currentProvider: {
            send: {
              call: (_web3: any, _method: any, callback: any) => {
                callback(error)
              },
            },
          },
        },
      }
      const { iframes } = init({ window: window as any })

      iframes.data.emit(PostMessages.WEB3, payload)
      expect(iframes.data.postMessage).toHaveBeenCalledWith(
        PostMessages.WEB3_RESULT,
        expect.objectContaining({
          error,
        })
      )
    })
  })
})
