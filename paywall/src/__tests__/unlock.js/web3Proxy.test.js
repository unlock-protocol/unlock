import * as config from '../../paywall-builder/config'
import web3Proxy from '../../unlock.js/web3Proxy'
import {
  POST_MESSAGE_READY_WEB3,
  POST_MESSAGE_WALLET_INFO,
  POST_MESSAGE_WEB3,
} from '../../paywall-builder/constants'

jest.mock('../../paywall-builder/config', () =>
  jest.genMockFromModule('../../paywall-builder/config')
)

describe('web3Proxy', () => {
  let fakeWindow
  let fakeIframe

  function makeFakeWindow() {
    fakeWindow = {
      Promise: Promise,
      web3: {
        currentProvider: {
          send: jest.fn(),
        },
      },
      location: {
        href: 'http://example.com?origin=http%3A%2F%2Ffun.times',
      },
      handlers: {},
      addEventListener(type, handler) {
        fakeWindow.handlers[type] = handler
      },
    }
  }

  describe('enable succeeds', () => {
    beforeEach(() => {
      config.enable.mockImplementationOnce(() => true)
      fakeIframe = {
        contentWindow: {
          postMessage: jest.fn(),
        },
      }
      makeFakeWindow()
    })

    it('listens for POST_MESSAGE_READY_WEB3 and dispatches the result', done => {
      expect.assertions(2)

      web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

      fakeWindow.handlers.message({
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

      fakeWindow.web3.currentProvider.isMetamask = true

      web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

      fakeWindow.handlers.message({
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
      config.enable.mockImplementationOnce(() => {
        throw new Error()
      })
      fakeIframe = {
        contentWindow: {
          postMessage: jest.fn(),
        },
      }
      makeFakeWindow()
    })

    afterEach(() => {
      config.enable = jest.fn()
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

      fakeWindow.handlers.message({
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
      const actualConfig = require.requireActual('../../paywall-builder/config')
      config.enable = actualConfig.enable

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

      fakeWindow.handlers.message({
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
        config.enable.mockImplementationOnce(() => {
          throw new Error()
        })
        fakeIframe = {
          contentWindow: {
            postMessage: jest.fn(),
          },
        }
        makeFakeWindow()

        web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

        fakeWindow.handlers.message({
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

        fakeWindow.handlers.message({
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
          config.enable = jest.fn(() => true)
          fakeIframe = {
            contentWindow: {
              postMessage: jest.fn(),
            },
          }

          makeFakeWindow()

          web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

          fakeWindow.handlers.message({
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

          fakeWindow.handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
              payload: false,
            },
          })

          fakeWindow.handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
              payload: 'hi',
            },
          })
          expect(fakeWindow.web3.currentProvider.send).not.toHaveBeenCalled()
          expect(fakeIframe.contentWindow.postMessage).not.toHaveBeenCalled()
        })

        it('payload method is not a string', () => {
          expect.assertions(2)
          fakeIframe.contentWindow.postMessage = jest.fn()

          fakeWindow.handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
              payload: {
                method: 1,
              },
            },
          })

          fakeWindow.handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_WEB3,
              payload: {
                method: false,
              },
            },
          })
          expect(fakeWindow.web3.currentProvider.send).not.toHaveBeenCalled()
          expect(fakeIframe.contentWindow.postMessage).not.toHaveBeenCalled()
        })

        it('payload params is not an array', () => {
          expect.assertions(2)
          fakeIframe.contentWindow.postMessage = jest.fn()

          fakeWindow.handlers.message({
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

          fakeWindow.handlers.message({
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
          expect(fakeWindow.web3.currentProvider.send).not.toHaveBeenCalled()
          expect(fakeIframe.contentWindow.postMessage).not.toHaveBeenCalled()
        })

        it('payload id is not an integer', () => {
          expect.assertions(2)
          fakeIframe.contentWindow.postMessage = jest.fn()

          fakeWindow.handlers.message({
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

          fakeWindow.handlers.message({
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
          expect(fakeWindow.web3.currentProvider.send).not.toHaveBeenCalled()
          expect(fakeIframe.contentWindow.postMessage).not.toHaveBeenCalled()
        })
      })

      describe('sendAsync', () => {
        beforeEach(async () => {
          makeFakeWindow()
          config.enable = jest.fn(() => true)

          fakeWindow.web3.currentProvider.sendAsync = jest.fn()

          web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

          fakeWindow.handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          fakeWindow.handlers.message({
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
            fakeWindow.web3.currentProvider.sendAsync
          ).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 1,
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [],
            }),
            expect.any(Function)
          )
          expect(fakeWindow.web3.currentProvider.send).not.toHaveBeenCalled()
        })
      })

      describe('send', () => {
        beforeEach(async () => {
          makeFakeWindow()
          config.enable = jest.fn(() => true)

          web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

          fakeWindow.handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          fakeWindow.handlers.message({
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

          expect(fakeWindow.web3.currentProvider.send).toHaveBeenCalledWith(
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
          config.enable = jest.fn(() => true)
          fakeIframe = {
            contentWindow: {
              postMessage: jest.fn(),
            },
          }

          makeFakeWindow()
          fakeWindow.web3.currentProvider.send = (thing, callbackinator) => {
            callbackinator('error', 'result')
          }
          fakeIframe.contentWindow.postMessage = jest.fn()

          web3Proxy(fakeWindow, fakeIframe, 'http://fun.times')

          fakeWindow.handlers.message({
            source: fakeIframe.contentWindow,
            origin: 'http://fun.times',
            data: {
              type: POST_MESSAGE_READY_WEB3,
              payload: 'it worked!',
            },
          })

          // flush the promise queue so these handler calls happen in order
          await Promise.resolve()

          fakeWindow.handlers.message({
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
