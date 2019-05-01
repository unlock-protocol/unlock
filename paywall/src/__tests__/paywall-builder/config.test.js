import { sendConfig, setupReadyListener } from '../../paywall-builder/config'
import {
  POST_MESSAGE_CONFIG,
  POST_MESSAGE_READY,
  POST_MESSAGE_ACCOUNT,
} from '../../paywall-builder/constants'

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
        expect.objectContaining({ type: POST_MESSAGE_CONFIG, payload: config }),
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

      window.unlockConfig = 'hi'
      const event = {
        origin: 'origin',
        source: iframe.contentWindow,
        data: POST_MESSAGE_READY,
      }
      setupReadyListener(window, iframe, 'origin')

      const listener = getListener()

      listener(event)

      expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: POST_MESSAGE_CONFIG,
          payload: 'hi',
        }),
        'origin'
      )
    })

    describe('sending ethereum account', () => {
      it('should enable the ethereum provider', done => {
        expect.assertions(1)

        window.ethereum = {
          enable: jest.fn(() => ({
            then() {
              done()
            },
          })),
        }

        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: POST_MESSAGE_READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)

        expect(window.ethereum.enable).toHaveBeenCalled()
      })

      it('should request accounts once enabled', done => {
        expect.assertions(1)

        window.ethereum = {
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
        }

        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: POST_MESSAGE_READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)
      })
      it('should not post anything on error', done => {
        expect.assertions(1)

        window.ethereum = {
          enable: () => Promise.resolve(),
          send: (content, callbackFunc) => {
            callbackFunc(true, false)

            expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
            done()
          },
        }

        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: POST_MESSAGE_READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)
      })

      it('should post the first account retrieved to the parent window', done => {
        expect.assertions(1)

        window.ethereum = {
          enable: () => Promise.resolve(),
          send: (content, callbackFunc) => {
            callbackFunc(null, { result: ['hi'] })

            expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
              expect.objectContaining({
                type: POST_MESSAGE_ACCOUNT,
                payload: 'hi',
              }),
              'origin'
            )
            done()
          },
        }

        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: POST_MESSAGE_READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)
      })
    })

    describe('failures', () => {
      it('should not post if origin does not match', () => {
        expect.assertions(1)

        window.unlockConfig = 'hi'
        const event = {
          origin: 'origin',
          source: iframe.contentWindow,
          data: POST_MESSAGE_READY,
        }
        setupReadyListener(window, iframe, 'not origin')

        const listener = getListener()

        listener(event)

        expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
      })

      it('should not post if source does not match', () => {
        expect.assertions(1)

        window.unlockConfig = 'hi'
        const event = {
          origin: 'origin',
          source: window,
          data: POST_MESSAGE_READY,
        }
        setupReadyListener(window, iframe, 'origin')

        const listener = getListener()

        listener(event)

        expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
      })

      it('should not post if message is not POST_MESSAGE_READY', () => {
        expect.assertions(1)

        window.unlockConfig = 'hi'
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
})
