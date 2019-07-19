import web3Proxy, { hasERC20Lock } from '../../unlock.js/web3Proxy'
import { IframeType, UnlockWindow, MessageHandler } from '../../windowTypes'
import setupIframeMailbox, {
  MapHandlers,
} from '../../unlock.js/setupIframeMailbox'
import { PostMessages } from '../../messageTypes'
import { Locks } from '../../unlockTypes'
import { waitFor } from '../../utils/promises'

describe('web3Proxy', () => {
  interface MockUnlockWindow extends UnlockWindow {
    storage?: {
      [key: string]: string
    }
  }
  let fakeWindow: MockUnlockWindow
  let fakeIframe: IframeType
  let handlers: {
    message: Array<(message: any) => void>
  }
  let mapHandlers: MapHandlers
  let fakeCheckoutIframe: IframeType
  let fakeDataIframe: IframeType
  let fakeAccountIframe: IframeType
  let postFromDataIframe: (message: any) => void
  let postFromAccountIframe: (message: any) => void
  let postFromCheckoutIframe: (message: any) => void
  const unlockAccountAddress = '0x1234567890123456789012345678901234567890'
  interface fakeWindowProps {
    enable: boolean | undefined
  }

  function makeFakeWindow({ enable = undefined }: fakeWindowProps) {
    let enableFuncOrUndefined
    switch (enable) {
      case true:
        enableFuncOrUndefined = () => Promise.resolve()
        break
      case false:
        enableFuncOrUndefined = () => Promise.reject(new Error('fail'))
    }
    handlers = {
      message: [],
    }
    process.env.PAYWALL_URL = 'http://fun.times'
    process.env.USER_IFRAME_URL = 'http://fun.times/account'
    fakeWindow = {
      Promise,
      origin: 'http://fun.times',
      CustomEvent,
      dispatchEvent: jest.fn(),
      unlockProtocol: {
        loadCheckoutModal: jest.fn(),
      },
      setInterval: jest.fn(),
      localStorage: {
        length: 1,
        clear: jest.fn(),
        key: jest.fn(),
        getItem: item =>
          (fakeWindow.storage && fakeWindow.storage[item]) || null,
        setItem: (key, value) =>
          fakeWindow.storage && (fakeWindow.storage[key] = value),
        removeItem: key => {
          if (undefined === fakeWindow.storage) return
          delete fakeWindow.storage[key]
        },
      },
      document: {
        createElement: jest.fn(),
        createEvent: jest.fn(),
        querySelector: jest.fn(),
        body: {
          style: {
            overflow: '',
          },
          insertAdjacentElement: jest.fn(),
        },
      },
      web3: {
        currentProvider: {
          send: jest.fn(),
          enable: enableFuncOrUndefined,
        },
      },
      addEventListener(type: 'message', handler: MessageHandler) {
        handlers[type].push(handler)
      },
    }
  }

  function makeFakeIframe() {
    fakeCheckoutIframe = {
      src: 'checkout',
      className: '',
      contentWindow: {
        postMessage: jest.fn(),
      },
      setAttribute: jest.fn(),
    }
    fakeIframe = fakeDataIframe = {
      src: 'data',
      className: '',
      contentWindow: {
        postMessage: jest.fn(),
      },
      setAttribute: jest.fn(),
    }
    fakeAccountIframe = {
      src: 'account',
      className: '',
      contentWindow: {
        postMessage: jest.fn(),
      },
      setAttribute: jest.fn(),
    }
    mapHandlers = setupIframeMailbox(
      fakeWindow,
      fakeCheckoutIframe,
      fakeDataIframe,
      fakeAccountIframe
    )
    postFromDataIframe = handlers.message[0]
    postFromCheckoutIframe = handlers.message[1]
    postFromAccountIframe = handlers.message[2]
  }

  const YesERC20Locks: Locks = {
    a: {
      address: 'a',
      name: '',
      keyPrice: '1',
      expirationDuration: 1,
      key: {
        expiration: 1,
        transactions: [],
        status: 'expired',
        confirmations: 1234,
        owner: 'b',
        lock: 'a',
      },
      currencyContractAddress: 'hi',
    },
    b: {
      address: 'b',
      name: '',
      keyPrice: '1',
      expirationDuration: 1,
      key: {
        expiration: 1,
        transactions: [],
        status: 'expired',
        confirmations: 1234,
        owner: 'b',
        lock: 'a',
      },
      currencyContractAddress: null,
    },
  }

  const NoERC20Locks: Locks = {
    a: {
      address: 'a',
      name: '',
      keyPrice: '1',
      expirationDuration: 1,
      key: {
        expiration: 1,
        transactions: [],
        status: 'expired',
        confirmations: 1234,
        owner: 'b',
        lock: 'a',
      },
      currencyContractAddress: null,
    },
    b: {
      address: 'b',
      name: '',
      keyPrice: '1',
      expirationDuration: 1,
      key: {
        expiration: 1,
        transactions: [],
        status: 'expired',
        confirmations: 1234,
        owner: 'b',
        lock: 'a',
      },
      currencyContractAddress: null,
    },
  }

  it('hasERC20Lock', () => {
    expect.assertions(2)

    expect(hasERC20Lock(YesERC20Locks)).toBe(true)
    expect(hasERC20Lock(NoERC20Locks)).toBe(false)
  })

  describe('no wallet exists', () => {
    describe('PostMessages.HIDE_MODAL', () => {
      beforeEach(() => {
        makeFakeWindow({ enable: false })
        makeFakeIframe()

        delete fakeWindow.web3

        web3Proxy(fakeWindow, mapHandlers)

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_ACCOUNT,
            id: 1,
            payload: null,
          },
        })

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_NETWORK,
            id: 1,
            payload: 3,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            payload: YesERC20Locks,
          },
        })

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.SHOW_ACCOUNTS_MODAL,
            payload: undefined,
          },
        })
      })

      it('should hide the accounts iframe', async () => {
        expect.assertions(1)

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.HIDE_ACCOUNTS_MODAL,
            payload: undefined,
          },
        })

        expect(fakeAccountIframe.className).toBe('unlock start')
      })
    })

    describe('PostMessages.SHOW_MODAL', () => {
      beforeEach(() => {
        makeFakeWindow({ enable: false })
        makeFakeIframe()

        delete fakeWindow.web3

        web3Proxy(fakeWindow, mapHandlers)

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_ACCOUNT,
            id: 1,
            payload: null,
          },
        })

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_NETWORK,
            id: 1,
            payload: 3,
          },
        })
      })

      it('should show the iframe if there are any erc20 locks', async () => {
        expect.assertions(1)

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            payload: YesERC20Locks,
          },
        })

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.SHOW_ACCOUNTS_MODAL,
            payload: undefined,
          },
        })

        expect(fakeAccountIframe.className).toBe('unlock start show')
      })

      it('should not show the iframe if there are no erc20 locks', async () => {
        expect.assertions(1)

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            payload: NoERC20Locks,
          },
        })

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.SHOW_ACCOUNTS_MODAL,
            payload: undefined,
          },
        })

        expect(fakeAccountIframe.className).toBe('')
      })
    })

    describe('no Unlock user account', () => {
      beforeEach(() => {
        makeFakeWindow({ enable: false })
        makeFakeIframe()

        delete fakeWindow.web3

        web3Proxy(fakeWindow, mapHandlers)

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_ACCOUNT,
            id: 1,
            payload: null,
          },
        })

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_NETWORK,
            id: 1,
            payload: 3,
          },
        })
      })

      it('should send wallet info as if there were a wallet if any ERC20 locks exist', done => {
        // if this test fails due to "too many assertions", uncomment the debug line in web3Proxy.ts
        expect.assertions(2)

        delete fakeWindow.web3
        fakeIframe.contentWindow.postMessage = (data, origin) => {
          expect(data).toEqual({
            type: PostMessages.WALLET_INFO,
            payload: {
              noWallet: false,
              notEnabled: false,
              isMetamask: false,
            },
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            id: 1,
            payload: YesERC20Locks,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            id: 1,
            payload: undefined,
          },
        })
      })

      it('should show the account iframe if there are erc20 locks', async () => {
        // if this test fails due to "too many assertions", uncomment the debug line in web3Proxy.ts
        expect.assertions(1)

        delete fakeWindow.web3

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            id: 1,
            payload: YesERC20Locks,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            id: 1,
            payload: undefined,
          },
        })

        // wait for the iframe to be shown
        await waitFor(() => fakeAccountIframe.className)
        expect(fakeAccountIframe.className).toBe('unlock start show')
      })

      it('if the account iframe loads before locks, it should show the account iframe if there are erc20 locks', async () => {
        // if this test fails due to "too many assertions", uncomment the debug line in web3Proxy.ts
        expect.assertions(1)

        delete fakeWindow.web3

        postFromAccountIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.SHOW_ACCOUNTS_MODAL,
            payload: undefined,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            payload: undefined,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            payload: YesERC20Locks,
          },
        })

        // wait for the iframe to be shown
        await waitFor(() => fakeAccountIframe.className)
        expect(fakeAccountIframe.className).toBe('unlock start show')
      })

      it('if the account iframe loads before locks, it should not show the account iframe if there are no erc20 locks', async done => {
        // if this test fails due to "too many assertions", uncomment the debug line in web3Proxy.ts
        expect.assertions(2)

        delete fakeWindow.web3

        fakeIframe.contentWindow.postMessage = data => {
          expect(data).toEqual({
            type: PostMessages.WALLET_INFO,
            payload: {
              noWallet: true,
              notEnabled: false,
              isMetamask: false,
            },
          })
          expect(fakeAccountIframe.className).toBe('')
          done()
        }

        postFromAccountIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.SHOW_ACCOUNTS_MODAL,
            payload: undefined,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            id: 1,
            payload: undefined,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            id: 1,
            payload: NoERC20Locks,
          },
        })
      })

      it('should not show the account iframe if there are no erc20 locks', async done => {
        // if this test fails due to "too many assertions", uncomment the debug line in web3Proxy.ts
        expect.assertions(2)

        delete fakeWindow.web3

        fakeIframe.contentWindow.postMessage = data => {
          expect(data).toEqual({
            type: PostMessages.WALLET_INFO,
            payload: {
              noWallet: true,
              notEnabled: false,
              isMetamask: false,
            },
          })
          expect(fakeAccountIframe.className).toBe('')
          done()
        }

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            id: 1,
            payload: NoERC20Locks,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            id: 1,
            payload: undefined,
          },
        })
      })

      it('should send wallet info with noWallet set if there are no ERC20 locks', done => {
        // if this test fails due to "too many assertions", uncomment the debug line in web3Proxy.ts
        expect.assertions(2)

        delete fakeWindow.web3
        fakeIframe.contentWindow.postMessage = (data, origin) => {
          expect(data).toEqual({
            type: PostMessages.WALLET_INFO,
            payload: {
              noWallet: true,
              notEnabled: false,
              isMetamask: false,
            },
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            id: 1,
            payload: NoERC20Locks,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            id: 1,
            payload: undefined,
          },
        })
      })

      it('should redirect key purchase requests to the data iframe if all locks are ETH locks', async () => {
        expect.assertions(2)

        let givenData: any
        let givenOrigin: any

        fakeDataIframe.contentWindow.postMessage = (data, origin) => {
          givenData = data
          givenOrigin = origin
        }
        fakeAccountIframe.contentWindow.postMessage = () => {
          // ensure we are not called
          expect(false).toBe(true)
        }

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            id: 1,
            payload: NoERC20Locks,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            id: 1,
            payload: undefined,
          },
        })

        postFromCheckoutIframe({
          source: fakeCheckoutIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.PURCHASE_KEY,
            id: 1,
            payload: {
              lock: '0x123',
              extraTip: '0',
            },
          },
        })

        // wait for the message to be posted
        await waitFor(() => givenData)

        expect(givenData).toEqual({
          type: PostMessages.PURCHASE_KEY,
          payload: {
            lock: '0x123',
            extraTip: '0',
          },
        })
        expect(givenOrigin).toBe('http://fun.times')
      })
    })

    describe('has Unlock user account', () => {
      let givenEvent: any
      let givenOrigin: string = ''
      beforeEach(async () => {
        makeFakeWindow({ enable: false })
        makeFakeIframe()
        delete fakeWindow.web3

        web3Proxy(fakeWindow, mapHandlers)

        // ordering of these posted messages should not matter
        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_LOCKS,
            id: 1,
            payload: YesERC20Locks,
          },
        })

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            id: 1,
            payload: undefined,
          },
        })

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_ACCOUNT,
            id: 1,
            payload: unlockAccountAddress,
          },
        })

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.UPDATE_NETWORK,
            id: 1,
            payload: 1,
          },
        })

        let gotWalletInfo = false

        fakeDataIframe.contentWindow.postMessage = (event, origin) => {
          if (event.type && event.type === PostMessages.WALLET_INFO) {
            gotWalletInfo = true
          } else {
            givenEvent = event
            givenOrigin = origin
          }
        }

        // first, wait for the wallet info to be returned
        await waitFor(() => gotWalletInfo)
      })

      it('should respond with the unlock account when eth_accounts is called', async () => {
        expect.assertions(2)

        // post to request the user account
        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.WEB3,
            id: 1,
            payload: {
              method: 'eth_accounts',
              params: [],
              id: 1,
              jsonrpc: '2.0',
            },
          },
        })

        expect(givenEvent).toEqual({
          type: PostMessages.WEB3_RESULT,
          payload: {
            id: 1,
            jsonrpc: '2.0',
            result: { id: 1, jsonrpc: '2.0', result: [unlockAccountAddress] },
          },
        })
        expect(givenOrigin).toBe('http://fun.times')
      })

      it('should respond with the correct network when net_version is called', async () => {
        expect.assertions(2)

        // post to request the network
        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.WEB3,
            id: 1,
            payload: {
              method: 'net_version',
              params: [],
              id: 1,
              jsonrpc: '2.0',
            },
          },
        })

        expect(givenEvent).toEqual({
          type: PostMessages.WEB3_RESULT,
          payload: {
            id: 1,
            jsonrpc: '2.0',
            result: { id: 1, jsonrpc: '2.0', result: 1 },
          },
        })
        expect(givenOrigin).toBe('http://fun.times')
      })

      it('should respond with an error for an unknown method call', async () => {
        // note: unknown methods must be polyfilled. Currently only
        // net_version and eth_accounts are called by walletService
        // unless a key purchase is attempted
        expect.assertions(2)

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.WEB3,
            id: 1,
            payload: {
              method: 'unknown_method',
              params: [],
              id: 1,
              jsonrpc: '2.0',
            },
          },
        })

        expect(givenEvent).toEqual({
          type: PostMessages.WEB3_RESULT,
          payload: {
            id: 1,
            jsonrpc: '2.0',
            error: '"unknown_method" is not supported',
          },
        })
        expect(givenOrigin).toBe('http://fun.times')
      })

      it('should redirect key purchase requests to the account iframe for any ERC20 locks', done => {
        expect.assertions(2)

        fakeDataIframe.contentWindow.postMessage = () => {
          // ensure we are not called
          expect(false).toBe(true)
        }
        fakeAccountIframe.contentWindow.postMessage = (data, origin) => {
          expect(data).toEqual({
            type: PostMessages.PURCHASE_KEY,
            payload: {
              lock: '0x123',
              extraTip: '0',
            },
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

        postFromCheckoutIframe({
          source: fakeCheckoutIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.PURCHASE_KEY,
            id: 1,
            payload: {
              lock: '0x123',
              extraTip: '0',
            },
          },
        })
      })

      it('should send INITIATED_TRANSACTION to the data iframe', done => {
        expect.assertions(2)

        fakeDataIframe.contentWindow.postMessage = () => {
          // ensure we are not called
          expect(false).toBe(true)
        }
        fakeDataIframe.contentWindow.postMessage = (data, origin) => {
          expect(data).toEqual({
            type: PostMessages.INITIATED_TRANSACTION,
            payload: undefined,
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

        postFromAccountIframe({
          source: fakeAccountIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.INITIATED_TRANSACTION,
            id: 1,
            payload: undefined,
          },
        })
      })
    })
  })

  describe('enable succeeds', () => {
    beforeEach(() => {
      makeFakeWindow({ enable: true })
      makeFakeIframe()
    })

    it('listens for PostMessages.READY_WEB3 and dispatches the result', done => {
      expect.assertions(2)

      web3Proxy(fakeWindow, mapHandlers)

      fakeIframe.contentWindow.postMessage = (data, origin) => {
        expect(data).toEqual({
          type: PostMessages.WALLET_INFO,
          payload: {
            noWallet: false,
            notEnabled: false,
            isMetamask: false,
          },
        })
        expect(origin).toBe('http://fun.times')
        done()
      }

      postFromDataIframe({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.READY_WEB3,
          payload: 'it worked!',
        },
      })
    })

    it('sets isMetamask for metamask wallets', done => {
      expect.assertions(2)

      if (!fakeWindow.web3) return // typescript...
      fakeWindow.web3.currentProvider.isMetamask = true

      web3Proxy(fakeWindow, mapHandlers)

      postFromDataIframe({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.READY_WEB3,
          payload: 'it worked!',
        },
      })

      fakeIframe.contentWindow.postMessage = (data, origin) => {
        expect(data).toEqual({
          type: PostMessages.WALLET_INFO,
          payload: {
            noWallet: false,
            notEnabled: false,
            isMetamask: true,
          },
        })
        expect(origin).toBe('http://fun.times')
        done()
      }
    })

    it('should not show the user iframe for ERC20 locks', done => {
      expect.assertions(2)

      web3Proxy(fakeWindow, mapHandlers)

      fakeIframe.contentWindow.postMessage = data => {
        expect(data).toEqual({
          type: PostMessages.WALLET_INFO,
          payload: {
            noWallet: false,
            notEnabled: false,
            isMetamask: false,
          },
        })
        expect(fakeAccountIframe.className).toBe('')
        done()
      }

      postFromDataIframe({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.UPDATE_LOCKS,
          id: 1,
          payload: YesERC20Locks,
        },
      })

      postFromDataIframe({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.READY_WEB3,
          id: 1,
          payload: undefined,
        },
      })
    })

    it('should not use the user accounts fake web3', done => {
      expect.assertions(3)

      // get the response we expect from our web3 wallet
      fakeWindow.web3 = {
        currentProvider: {
          send(params, callback) {
            expect(this).toBe(
              fakeWindow.web3 && fakeWindow.web3.currentProvider
            )
            expect(params).toEqual({
              method: 'eth_accounts',
              params: [],
              jsonrpc: '2.0',
              id: 1,
            })
            callback(null, ['hi'])
            return
          },
        },
      }

      web3Proxy(fakeWindow, mapHandlers)

      postFromDataIframe({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.UPDATE_LOCKS,
          id: 1,
          payload: YesERC20Locks,
        },
      })

      // pretend we have just received the user account and network
      // from the account iframe
      postFromAccountIframe({
        source: fakeAccountIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.UPDATE_ACCOUNT,
          id: 1,
          payload: null,
        },
      })

      postFromAccountIframe({
        source: fakeAccountIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.UPDATE_NETWORK,
          id: 1,
          payload: 1,
        },
      })

      fakeIframe.contentWindow.postMessage = data => {
        expect(data).toEqual({
          type: PostMessages.WEB3_RESULT,
          payload: {
            id: 1,
            jsonrpc: '2.0',
            result: ['hi'],
          },
        })
        done()
      }

      postFromDataIframe({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.WEB3,
          id: 1,
          payload: {
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_accounts',
            params: [],
          },
        },
      })
    })
  })

  describe('enable fails', () => {
    beforeEach(() => {
      makeFakeWindow({ enable: false })
      makeFakeIframe()

      web3Proxy(fakeWindow, mapHandlers)
    })

    it('should send wallet info with notEnabled set if enable fails', done => {
      // if this test fails due to "too many assertions", uncomment the debug line in web3Proxy.ts
      expect.assertions(2)

      fakeIframe.contentWindow.postMessage = (data, origin) => {
        expect(data).toEqual({
          type: PostMessages.WALLET_INFO,
          payload: {
            noWallet: false,
            notEnabled: true,
            isMetamask: false,
          },
        })
        expect(origin).toBe('http://fun.times')
        done()
      }

      postFromDataIframe({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: PostMessages.READY_WEB3,
          payload: 'it worked!',
        },
      })
    })

    describe('web3 proxy', () => {
      beforeEach(() => {
        makeFakeWindow({ enable: false })
        makeFakeIframe()

        web3Proxy(fakeWindow, mapHandlers)

        postFromDataIframe({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: PostMessages.READY_WEB3,
            payload: 'it worked!',
          },
        })
      })

      describe('malformed request payload', () => {
        beforeEach(() => {
          makeFakeWindow({ enable: true })
          makeFakeIframe()

          web3Proxy(fakeWindow, mapHandlers)

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.READY_WEB3,
              payload: 'it worked!',
            },
          })
        })

        it('payload is not a proper object', () => {
          expect.assertions(2)
          fakeIframe.contentWindow.postMessage = jest.fn()

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: false,
            },
          })

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: 'hi',
            },
          })
          expect(
            fakeWindow.web3 && fakeWindow.web3.currentProvider.send
          ).not.toHaveBeenCalled()
          expect(fakeIframe.contentWindow.postMessage).not.toHaveBeenCalled()
        })

        it('payload method is not a string', () => {
          expect.assertions(2)
          fakeIframe.contentWindow.postMessage = jest.fn()

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: 1,
              },
            },
          })

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: false,
              },
            },
          })
          expect(
            fakeWindow.web3 && fakeWindow.web3.currentProvider.send
          ).not.toHaveBeenCalled()
          expect(fakeIframe.contentWindow.postMessage).not.toHaveBeenCalled()
        })

        it('payload params is not an array', () => {
          expect.assertions(2)
          fakeIframe.contentWindow.postMessage = jest.fn()

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: 'eth_call',
                params: 1,
              },
            },
          })

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: 'eth_call',
                params: false,
              },
            },
          })
          expect(
            fakeWindow.web3 && fakeWindow.web3.currentProvider.send
          ).not.toHaveBeenCalled()
          expect(fakeIframe.contentWindow.postMessage).not.toHaveBeenCalled()
        })

        it('payload id is not an integer', () => {
          expect.assertions(2)
          fakeIframe.contentWindow.postMessage = jest.fn()

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: 'eth_call',
                params: [],
                id: [],
              },
            },
          })

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: 'eth_call',
                params: [],
                id: 1.3,
              },
            },
          })
          expect(
            fakeWindow.web3 && fakeWindow.web3.currentProvider.send
          ).not.toHaveBeenCalled()
          expect(fakeIframe.contentWindow.postMessage).not.toHaveBeenCalled()
        })
      })

      describe('sendAsync', () => {
        beforeEach(async () => {
          makeFakeWindow({ enable: true })

          fakeWindow.web3 &&
            (fakeWindow.web3.currentProvider.sendAsync = jest.fn())

          web3Proxy(fakeWindow, mapHandlers)

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: 'eth_call',
                params: [],
                id: 1,
              },
            },
          })
        })

        it('should use sendAsync if available', async () => {
          expect.assertions(2)

          expect(
            fakeWindow.web3 && fakeWindow.web3.currentProvider.sendAsync
          ).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 1,
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [],
            }),
            expect.any(Function)
          )
          expect(
            fakeWindow.web3 && fakeWindow.web3.currentProvider.send
          ).not.toHaveBeenCalled()
        })
      })

      describe('send', () => {
        beforeEach(async () => {
          makeFakeWindow({ enable: true })

          web3Proxy(fakeWindow, mapHandlers)

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: 'eth_call',
                params: [],
                id: 1,
              },
            },
          })
        })

        it('should use send if sendAsync is not available', async () => {
          expect.assertions(1)

          expect(
            fakeWindow.web3 && fakeWindow.web3.currentProvider.send
          ).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 1,
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [],
            }),
            expect.any(Function)
          )
        })
      })

      describe('successful request', () => {
        beforeEach(async () => {
          makeFakeWindow({ enable: true })
          makeFakeIframe()
          fakeWindow.web3 &&
            (fakeWindow.web3.currentProvider.send = (_, callbackinator) => {
              callbackinator('error', 'result')
            })
          fakeIframe.contentWindow.postMessage = jest.fn()

          web3Proxy(fakeWindow, mapHandlers)

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          postFromDataIframe({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: PostMessages.WEB3,
              payload: {
                method: 'eth_call',
                params: [],
                id: 1,
              },
            },
          })
        })

        it('posts the result to the iframe', () => {
          expect.assertions(1)

          expect(fakeIframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
            2,
            {
              payload: {
                error: 'error',
                id: 1,
                jsonrpc: '2.0',
              },
              type: PostMessages.WEB3,
            },
            'http://fun.times'
          )
        })
      })
    })
  })
})
