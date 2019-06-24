import web3Proxy from '../../unlock.js/web3Proxy'
import { IframeType, UnlockWindow, MessageHandler } from '../../windowTypes'
import setupIframeMailbox, {
  MapHandlers,
} from '../../unlock.js/setupIframeMailbox'
import { PostMessages } from '../../messageTypes'

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
  const unlockAccountAddress = '0x12345678901`23456789012345678901234567890'
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

  describe('no wallet exists', () => {
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

      it('should send wallet info with noWallet set if there is no wallet at all', done => {
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
            type: PostMessages.READY_WEB3,
            id: 1,
            payload: undefined,
          },
        })
      })
    })

    describe('has Unlock user account', () => {
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
      })

      it('should send wallet info with wallet enabled', done => {
        // if this test fails due to "too many assertions", uncomment the debug line in web3Proxy.ts
        expect.assertions(2)

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
            id: 1,
            payload: undefined,
          },
        })
      })

      it('should respond with the unlock account when eth_accounts is called', done => {
        expect.assertions(2)

        fakeIframe.contentWindow.postMessage = (data, origin) => {
          expect(data).toEqual({
            type: PostMessages.WEB3_RESULT,
            payload: {
              id: 1,
              error: null,
              result: [unlockAccountAddress],
            },
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

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
      })

      it('should respond with the correct network when net_version is called', done => {
        expect.assertions(2)

        fakeIframe.contentWindow.postMessage = (data, origin) => {
          expect(data).toEqual({
            type: PostMessages.WEB3_RESULT,
            payload: {
              id: 1,
              error: null,
              result: 1,
            },
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

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
      })

      it('should respond with an error for an unknown method call', done => {
        // note: unknown methods must be polyfilled. Currently only
        // net_version and eth_accounts are called by walletService
        // unless a key purchase is attempted
        expect.assertions(2)

        fakeIframe.contentWindow.postMessage = (data, origin) => {
          expect(data).toEqual({
            type: PostMessages.WEB3_RESULT,
            payload: {
              id: 1,
              error: '"unknown_method" is not supported',
              result: null,
            },
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

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
      })

      it('should redirect key purchase requests to the account iframe', done => {
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
          id: 1,
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
            id: 1,
            payload: 'it worked!',
          },
        })
      })

      it('fails if there is no web3 wallet', done => {
        expect.assertions(2)
        delete fakeWindow.web3

        fakeIframe.contentWindow.postMessage = (data, origin) => {
          expect(data).toEqual({
            type: PostMessages.WEB3,
            payload: {
              error: 'No web3 wallet is available',
              id: 1,
              result: null,
            },
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

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

          expect(fakeIframe.contentWindow.postMessage).toHaveBeenCalledWith(
            {
              payload: {
                error: 'error',
                id: 1,
                result: 'result',
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
