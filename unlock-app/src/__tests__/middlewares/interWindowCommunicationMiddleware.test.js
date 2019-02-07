import interWindowCommunicationMiddleware from '../../middlewares/interWindowCommunicationMiddleware'
import { openNewWindowModal, hideModal } from '../../actions/modal'

describe('interWindowCommunicationMiddleware', () => {
  describe('middleware functionality', () => {
    it('does respond to OPEN_MODAL_IN_NEW_WINDOW if in an iframe', () => {
      expect.assertions(2)
      const next = jest.fn()

      const action = openNewWindowModal()

      const store = {
        getState() {
          return {
            router: {
              location: {
                pathname: '/paywall/',
              },
            },
          }
        },
        dispatch: jest.fn(),
      }

      const window = {
        parent: {
          postMessage: jest.fn(),
          origin: 'origin',
        },
        addEventListener() {},
      }
      window.self = window
      window.top = 'not window'

      const middleware = interWindowCommunicationMiddleware(window)

      const { getState } = store
      middleware(store)(next)(action)

      expect(next).toHaveBeenCalledWith(action)
      expect(window.parent.postMessage).toHaveBeenCalledWith(
        'redirect',
        'origin'
      )
    })
    it('does not respond to OPEN_MODAL_IN_NEW_WINDOW if not in an iframe', () => {
      expect.assertions(2)
      const store = {
        getState() {},
      }

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

      const middleware = interWindowCommunicationMiddleware(window)

      middleware(store)(next)(action)

      expect(next).toHaveBeenCalledWith(action)
      expect(window.parent.contentWindow.postMessage).not.toHaveBeenCalled()
    })
    it('responds to HIDE_MODAL and redirects if present in the route url and in the main window', () => {
      expect.assertions(2)
      const store = {
        getState() {
          return {
            account: {
              address: 'address',
            },
            router: {
              location: {
                pathname:
                  '/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere',
              },
            },
          }
        },
      }

      const next = jest.fn()

      const action = hideModal()

      const window = {
        location: {
          href: 'href',
        },
      }
      window.self = window
      window.top = window

      const middleware = interWindowCommunicationMiddleware(window)

      middleware(store)(next)(action)

      expect(next).toHaveBeenCalledWith(action)
      expect(window.location.href).toBe('http://hithere#address')
    })
    it('ignores HIDE_MODAL in the iframe', () => {
      expect.assertions(2)
      const store = {
        getState() {
          return {
            router: {
              location: {
                pathname:
                  '/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere',
              },
            },
          }
        },
      }

      const next = jest.fn()

      const action = hideModal()

      const window = {
        location: {
          href: 'href',
        },
        addEventListener() {},
      }
      window.self = window
      window.top = {}

      const middleware = interWindowCommunicationMiddleware(window)

      middleware(store)(next)(action)

      expect(next).toHaveBeenCalledWith(action)
      expect(window.location.href).toBe('href')
    })
    it('ignores HIDE_MODAL if redirect is not present in the route url and in the main window', () => {
      expect.assertions(2)
      const store = {
        getState() {
          return {
            account: {
              address: '',
            },
            router: {
              location: {
                pathname: '/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
              },
            },
          }
        },
      }

      const next = jest.fn()

      const action = hideModal()

      const window = {
        location: {
          href: 'href',
        },
        addEventListener() {},
      }
      window.self = window
      window.top = window

      const middleware = interWindowCommunicationMiddleware(window)

      middleware(store)(next)(action)

      expect(next).toHaveBeenCalledWith(action)
      expect(window.location.href).toBe('href')
    })
    it('passes actions to the next middleware', () => {
      expect.assertions(1)
      const store = {
        getState() {},
      }

      const next = jest.fn()

      const action = {
        type: 'boo',
      }

      const window = {}

      const middleware = interWindowCommunicationMiddleware(window)

      middleware(store)(next)(action)
      expect(next).toHaveBeenCalledWith(action)
    })
  })
})
