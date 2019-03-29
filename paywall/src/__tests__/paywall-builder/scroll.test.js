import {
  scrollLoop,
  enableScrollPolling,
  disableScrollPolling,
} from '../../paywall-builder/scroll'
import { POST_MESSAGE_SCROLL_POSITION } from '../../paywall-builder/constants'

describe('buildPaywall', () => {
  let document
  function scrollThatPage(window) {
    window.pageYOffset += 20
  }

  beforeEach(() => {
    document = {
      documentElement: {
        scrollHeight: 22293,
      },
      body: {
        style: {},
      },
      createElement: jest.fn(() => ({
        style: {},
      })),
    }
  })

  afterEach(() => jest.restoreAllMocks())

  describe('scrollLoop', () => {
    let window
    let postMessage
    let iframe
    beforeEach(() => {
      postMessage = jest.fn()
      iframe = {
        contentWindow: {
          postMessage,
        },
        style: {},
      }

      window = {
        requestAnimationFrame: jest.fn(),
        location: {
          hash: '',
        },
        innerHeight: 266,
        pageYOffset: 0, // change to "scroll"
        origin: 'origin/',
        URL: () => {
          return {
            origin: 'origin',
          }
        },
      }
    })

    describe('scrollLoop', () => {
      it('does not send scroll if the window is fully scrolled', () => {
        expect.assertions(1)

        document.documentElement.scrollHeight = window.innerHeight
        enableScrollPolling()
        scrollLoop(window, document, iframe, 'origin')

        expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
      })

      it('does nothing if scroll polling is disabled', () => {
        expect.assertions(1)

        iframe.contentWindow.postMessage.mockClear()

        enableScrollPolling()
        disableScrollPolling()
        scrollLoop(window, document, iframe, 'origin')

        expect(iframe.contentWindow.postMessage).not.toHaveBeenCalled()
      })

      it('sends a scroll position if the window is scrolled', () => {
        expect.assertions(1)

        iframe.contentWindow.postMessage.mockClear()

        enableScrollPolling()
        scrollLoop(window, document, iframe, 'origin')

        expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
          {
            type: POST_MESSAGE_SCROLL_POSITION,
            payload: 140.97744360902254,
          },
          'origin'
        )
      })

      it('sends a weighted scroll position', () => {
        expect.assertions(2)

        iframe.contentWindow.postMessage.mockClear()

        enableScrollPolling()
        scrollLoop(window, document, iframe, 'origin')
        scrollThatPage(window) // scroll down 20 pixels
        scrollLoop(window, document, iframe, 'origin')

        expect(iframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
          1,
          {
            type: POST_MESSAGE_SCROLL_POSITION,
            payload: 140.97744360902254,
          },
          'origin'
        )

        expect(iframe.contentWindow.postMessage).toHaveBeenNthCalledWith(
          2,
          {
            type: POST_MESSAGE_SCROLL_POSITION,
            payload: 141.06824126644298,
          },
          'origin'
        )
      })

      it('requests a new animation frame for the next scroll check', () => {
        expect.assertions(1)

        enableScrollPolling()
        scrollLoop(window, document, iframe, 'origin')

        expect(window.requestAnimationFrame).toHaveBeenCalled()
      })

      it('calls scrollLoop in the requestAnimationFrame callback', () => {
        expect.assertions(2)

        iframe.contentWindow.postMessage.mockClear()

        enableScrollPolling()
        scrollLoop(window, document, iframe, 'origin')

        expect(window.requestAnimationFrame).toHaveBeenCalled()
        const scrollCb = window.requestAnimationFrame.mock.calls[0][0]

        scrollThatPage(window)
        scrollCb()

        expect(iframe.contentWindow.postMessage).toHaveBeenCalledTimes(2)
      })
    })
  })
})
