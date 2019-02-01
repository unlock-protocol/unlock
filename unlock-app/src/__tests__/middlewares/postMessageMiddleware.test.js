import postMessageMiddleware, {
  inIframe,
} from '../../middlewares/postMessageMiddleware'
import { openNewWindowModal } from '../../actions/modal'

describe('postMessageMiddleware', () => {
  describe('inIframe', () => {
    it('should return false when self == top', () => {
      const window = {}
      window.self = window
      window.top = window
      expect(inIframe(window)).toBe(false)
    })
    it('should return true when self != top', () => {
      const window = {
        self: 'nope',
        top: 'yes',
      }
      expect(inIframe(window)).toBe(true)
    })
    it('should return true when an exception is thrown', () => {
      expect(inIframe()).toBe(true)
    })
  })

  describe('middleware functionality', () => {
    it('does responds to OPEN_MODAL_IN_NEW_WINDOW if in an iframe', () => {
      expect.assertions(2)
      const next = jest.fn()

      const action = openNewWindowModal()

      const window = {
        parent: {
          contentWindow: {
            postMessage: jest.fn(),
            origin: 'origin',
          },
        },
      }
      window.self = window
      window.top = 'not window'

      const middleware = postMessageMiddleware(window)

      middleware()(next)(action)

      expect(next).toHaveBeenCalledWith(action)
      expect(window.parent.contentWindow.postMessage).toHaveBeenCalledWith(
        'redirect',
        'origin'
      )
    })
    it('does not respond to OPEN_MODAL_IN_NEW_WINDOW if not in an iframe', () => {
      expect.assertions(2)
      const next = jest.fn()

      const action = openNewWindowModal()

      const window = {
        parent: {
          contentWindow: {
            postMessage: jest.fn(),
            origin: 'origin',
          },
        },
      }
      window.self = window
      window.top = window

      const middleware = postMessageMiddleware(window)

      middleware()(next)(action)

      expect(next).toHaveBeenCalledWith(action)
      expect(window.parent.contentWindow.postMessage).not.toHaveBeenCalled()
    })
    it('passes actions to the next middleware', () => {
      expect.assertions(1)
      const next = jest.fn()

      const action = {
        type: 'boo',
      }

      const window = {}

      const middleware = postMessageMiddleware(window)

      middleware()(next)(action)
      expect(next).toHaveBeenCalledWith(action)
    })
  })
})
