import web3Proxy from '../../unlock.js/web3Proxy'
import {
  POST_MESSAGE_READY_WEB3,
  POST_MESSAGE_WALLET_INFO,
  POST_MESSAGE_WEB3,
} from '../../paywall-builder/constants'
import { IframeType, UnlockWindow, MessageHandler } from '../../windowTypes'

describe('web3Proxy', () => {
  interface MockUnlockWindow extends UnlockWindow {
    storage?: {
      [key: string]: string
    }
  }
  let fakeWindow: MockUnlockWindow
  let fakeIframe: IframeType
  let handlers: {
    message: Function
  }

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
      message: () => {},
    }
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
        handlers[type] = handler
      },
    }
  }

  function makeFakeIframe() {
    fakeIframe = {
      className: '',
      src: '',
      setAttribute: jest.fn(),
      contentWindow: {
        postMessage: jest.fn(),
      },
    }
  }

  describe('enable succeeds', () => {
    beforeEach(() => {
      makeFakeIframe()
      makeFakeWindow({ enable: true })
    })

    it('listens for POST_MESSAGE_READY_WEB3 and dispatches the result', done => {
      expect.assertions(2)

      web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

      handlers.message({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: POST_MESSAGE_READY_WEB3,
          payload: 'it worked!',
        },
      })

      fakeIframe.contentWindow.postMessage = (data, origin) => {
        expect(data).toEqual({
          type: POST_MESSAGE_WALLET_INFO,
          payload: {
            noWallet: false,
            notEnabled: false,
            isMetamask: false,
          },
        })
        expect(origin).toBe('http://fun.times')
        done()
      }
    })

    it('sets isMetamask for metamask wallets', done => {
      expect.assertions(2)

      if (!fakeWindow.web3) return // typescript...
      fakeWindow.web3.currentProvider.isMetamask = true

      web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

      handlers.message({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: POST_MESSAGE_READY_WEB3,
          payload: 'it worked!',
        },
      })

      fakeIframe.contentWindow.postMessage = (data, origin) => {
        expect(data).toEqual({
          type: POST_MESSAGE_WALLET_INFO,
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
      makeFakeIframe()
      makeFakeWindow({ enable: false })
    })

    it('sends wallet info with notEnabled set if enable fails', done => {
      expect.assertions(2)

      fakeIframe.contentWindow.postMessage = (data, origin) => {
        expect(data).toEqual({
          type: POST_MESSAGE_WALLET_INFO,
          payload: {
            noWallet: false,
            notEnabled: true,
            isMetamask: false,
          },
        })
        expect(origin).toBe('http://fun.times')
        done()
      }

      web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

      handlers.message({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: POST_MESSAGE_READY_WEB3,
          id: 1,
          payload: 'it worked!',
        },
      })
    })

    it('sends wallet info with noWallet set if there is no wallet at all', done => {
      expect.assertions(2)

      delete fakeWindow.web3
      fakeIframe.contentWindow.postMessage = (data, origin) => {
        expect(data).toEqual({
          type: POST_MESSAGE_WALLET_INFO,
          payload: {
            noWallet: true,
            notEnabled: false,
            isMetamask: false,
          },
        })
        expect(origin).toBe('http://fun.times')
        done()
      }

      web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

      handlers.message({
        source: fakeIframe.contentWindow,
        origin: 'http://fun.times',
        data: {
          type: POST_MESSAGE_READY_WEB3,
          id: 1,
          payload: 'it worked!',
        },
      })
    })

    describe('web3 proxy', () => {
      beforeEach(() => {
        makeFakeIframe()
        makeFakeWindow({ enable: false })

        web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

        handlers.message({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: POST_MESSAGE_READY_WEB3,
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
            type: POST_MESSAGE_WEB3,
            payload: {
              error: 'No web3 wallet is available',
              id: 1,
              result: null,
            },
          })
          expect(origin).toBe('http://fun.times')
          done()
        }

        handlers.message({
          source: fakeIframe.contentWindow,
          origin: 'http://fun.times',
          data: {
            type: POST_MESSAGE_WEB3,
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
          makeFakeIframe()
          makeFakeWindow({ enable: true })

          web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_READY_WEB3,
              payload: 'it worked!',
            },
          })
        })

        it('payload is not a proper object', () => {
          expect.assertions(2)
          fakeIframe.contentWindow.postMessage = jest.fn()

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
              payload: false,
            },
          })

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
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

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
              payload: {
                method: 1,
              },
            },
          })

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
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

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
              payload: {
                method: 'eth_call',
                params: 1,
              },
            },
          })

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
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

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
              payload: {
                method: 'eth_call',
                params: [],
                id: [],
              },
            },
          })

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
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

          web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
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

          web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
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
          makeFakeIframe()
          makeFakeWindow({ enable: true })
          fakeWindow.web3 &&
            (fakeWindow.web3.currentProvider.send = (_, callbackinator) => {
              callbackinator('error', 'result')
            })
          fakeIframe.contentWindow.postMessage = jest.fn()

          web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
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
              type: POST_MESSAGE_WEB3,
            },
            'http://fun.times'
          )
        })
      })
    })
  })
})
