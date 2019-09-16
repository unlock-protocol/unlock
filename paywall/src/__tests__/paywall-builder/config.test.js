import {
  sendConfig,
  setupReadyListener,
  enable,
} from '../../paywall-builder/config'
import { PostMessages } from '../../messageTypes'

describe('paywall configuration inter-window communication', () => {
  describe('sending configuration to the iframe with sendConfig', () => {
    let iframe
    beforeEach(() => {
      iframe = {
        contentWindow: {
          postMessage: jest.fn(),
        },
      }
    })

    it('should do nothing for falsy config', () => {
      expect.assertions(1)

      const config = undefined
      sendConfig(config, iframe, 'origin')

      expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
    })

    it('should post a message with the config', () => {
      expect.assertions(1)

      const config = {
        hi: 'there',
        beautiful: {
          thing: 'is is not?',
        },
      }
      sendConfig(config, iframe, 'origin')

      expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: PostMessages.CONFIG, payload: config }),
        'origin'
      )
    })
  })

  describe('setupReadyListener', () => {
    let window
    let iframe

    function getListener() {
      return window.addEventListener.mock.calls[0][1]
    }
    beforeEach(() => {
      window = {
        Promise: global.Promise,
        addEventListener: jest.fn(),
      }
      iframe = {
        contentWindow: {
          postMessage: jest.fn(),
        },
      }
    })

    it('should post a message when ready', () => {
      expect.assertions(1)

      window.unlockProtocolConfig = 'hi'
      const event = {
        origin: 'origin',
        source: iframe.contentWindow,
        data: PostMessages.READY,
      }
      setupReadyListener(window, iframe, 'origin')

      const listener = getListener()

      listener(event)

      expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: PostMessages.CONFIG,
          payload: 'hi',
        }),
        'origin'
      )
    })

    describe('sending ethereum account', () => {
      it('should enable the ethereum provider', done => {
        expect.assertions(1)

        window.web3 = {
          currentProvider: {
            enable: jest.fn(() => ({
              then() {
                done()
              },
            })),
          },
        }

        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: PostMessages.READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)

        expect(window.web3.currentProvider.enable).toHaveBeenCalled()
      })

      it('should request accounts once enabled', done => {
        expect.assertions(1)

        window.web3 = {
          currentProvider: {
            enable: () => Promise.resolve(),
            send: jest.fn(content => {
              expect(content).toEqual(
                expect.objectContaining({
                  method: 'eth_accounts',
                  params: [],
                  jsonrpc: '2.0',
                  id: expect.any(Number),
                })
              )
              done()
            }),
          },
        }

        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: PostMessages.READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)
      })
      it('should not post anything on error', done => {
        expect.assertions(1)

        window.web3 = {
          currentProvider: {
            enable: () => Promise.resolve(),
            send: (content, callbackFunc) => {
              callbackFunc(true, false)

              expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
              done()
            },
          },
        }

        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: PostMessages.READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)
      })

      it('should post the first account retrieved to the parent window', done => {
        expect.assertions(1)

        window.web3 = {
          currentProvider: {
            enable: () => Promise.resolve(),
            send: (content, callbackFunc) => {
              callbackFunc(null, { result: ['hi'] })

              expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                  type: PostMessages.ACCOUNT,
                  payload: 'hi',
                }),
                'origin'
              )
              done()
            },
          },
        }

        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: PostMessages.READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)
      })
    })

    describe('failures', () => {
      it('should not post if origin does not match', () => {
        expect.assertions(1)

        window.unlockProtocolConfig = 'hi'
        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: PostMessages.READY,
        }
        setupReadyListener(window, iframe, 'not origin')

        const listener = getListener()

        listener(event)

        expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
      })

      it('should not post if source does not match', () => {
        expect.assertions(1)

        window.unlockProtocolConfig = 'hi'
        const event = {
          origin: 'origin',
          source: window,
          data: PostMessages.READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)

        expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
      })

      it('should not post if message is not PostMessages.READY', () => {
        expect.assertions(1)

        window.unlockProtocolConfig = 'hi'
        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: 'nope',
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)

        expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
      })
    })
  })

  describe('enable', () => {
    it('throws ReferenceError if web3 is not available', async () => {
      expect.assertions(2)

      try {
        await enable({
          Promise: Promise,
        })
      } catch (e) {
        expect(e).toBeInstanceOf(ReferenceError)
        expect(e.message).toBe('no web3 wallet exists')
      }
    })

    it('throws if the provider enable throws', async () => {
      expect.assertions(1)

      try {
        await enable({
          Promise: Promise,
          web3: {
            currentProvider: {
              enable: async () => {
                throw new Error('oops')
              },
            },
          },
        })
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
      }
    })
  })
})
