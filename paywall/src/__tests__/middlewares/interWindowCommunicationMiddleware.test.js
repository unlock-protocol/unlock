import { openNewWindowModal, hideModal } from '../../actions/modal'
import { setAccount } from '../../actions/accounts'
import interWindowCommunicationMiddleware from '../../middlewares/interWindowCommunicationMiddleware'
import { updateKey } from '../../actions/key'
import { POST_MESSAGE_REDIRECT } from '../../paywall-builder/constants'

jest.mock('../../utils/localStorage')

describe('interWindowCommunicationMiddleware', () => {
  const lock = '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54'
  const account = '0xaaaaa25a3e7Fb15263D0DD455B8aAfc08503bb54'

  describe('middleware functionality', () => {
    describe('not in an iframe, running at /paywall in main window', () => {
      it('does not respond to OPEN_MODAL_IN_NEW_WINDOW', () => {
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
              account: {},
              modals: {},
            }
          },
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
      it('responds to HIDE_MODAL and redirects if present in the route url', () => {
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
      it('ignores HIDE_MODAL if redirect is not present in the route url', () => {
        expect.assertions(2)
        const store = {
          getState() {
            return {
              account: {
                address: '',
              },
              router: {
                location: {
                  pathname:
                    '/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
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
      it('responds to UPDATE_KEY when not showing the modal, and redirects if present in the route url', () => {
        expect.assertions(2)

        const key = {
          id: `${lock}-${account}`,
          lock,
          owner: account,
          expiration: new Date().getTime() / 1000 + 10000,
          data: null,
        }

        const store = {
          getState() {
            return {
              account: {
                address: account,
              },
              router: {
                location: {
                  pathname: `/paywall/${lock}/http%3a%2f%2fhithere`,
                },
              },
              keys: {
                [key.id]: key,
              },
              modals: {},
            }
          },
        }

        const next = jest.fn()

        const action = updateKey(key.id, key)

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
        expect(window.location.href).toBe(`http://hithere#${account}`)
      })
      it('ignores UPDATE_KEY if redirect is not present in the route url', () => {
        expect.assertions(2)
        const store = {
          getState() {
            return {
              account: {
                address: '',
              },
              router: {
                location: {
                  pathname:
                    '/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
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
    })
    describe("running in the iframe inside the publisher's content window", () => {
      it('does respond to OPEN_MODAL_IN_NEW_WINDOW if in an iframe', () => {
        expect.assertions(2)
        const next = jest.fn()

        const action = openNewWindowModal()

        const store = {
          getState() {
            return {
              account: {
                address: '0xabc',
              },
              router: {
                location: {
                  pathname:
                    '/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere',
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

        middleware(store)(next)(action)

        expect(next).toHaveBeenCalledWith(action)
        expect(window.parent.postMessage).toHaveBeenCalledWith(
          POST_MESSAGE_REDIRECT,
          'origin'
        )
      })
      it('ignores HIDE_MODAL', () => {
        expect.assertions(2)
        const store = {
          getState() {
            return {
              account: {
                address: '0xabc',
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
          addEventListener() {},
        }
        window.self = window
        window.top = {}

        const middleware = interWindowCommunicationMiddleware(window)

        middleware(store)(next)(action)

        expect(next).toHaveBeenCalledWith(action)
        expect(window.location.href).toBe('href')
      })
      describe('no account present', () => {
        describe('if account passed in URL hash', () => {
          let store
          let window
          beforeEach(() => {
            store = {
              getState() {
                return {
                  account: null,
                  router: {
                    location: {
                      pathname: `/paywall/${lock}`,
                      hash: `#${account}`,
                    },
                  },
                }
              },
              dispatch: jest.fn(),
            }
            window = {
              localStorage: {
                setItem: jest.fn(),
                getItem: jest.fn(() => null),
              },
            }
            window.self = window
            window.top = {}
          })
          it('should dispatch SET_ACCOUNT', () => {
            expect.assertions(1)
            const middleware = interWindowCommunicationMiddleware(window)
            middleware(store)(() => {})({})

            expect(store.dispatch).toHaveBeenCalledWith(
              setAccount({ address: account })
            )
          })
          it('should save the account in localStorage', () => {
            expect.assertions(1)
            const middleware = interWindowCommunicationMiddleware(window)
            middleware(store)(() => {})({})

            expect(window.localStorage.setItem).toHaveBeenCalledWith(
              '__unlock__account__',
              account
            )
          })
        })
      })
      describe('normal usage post-key purchase', () => {
        let store
        let window
        beforeEach(() => {
          store = {
            getState() {
              return {
                account: null,
                router: {
                  location: {
                    pathname: `/paywall/${lock}`,
                  },
                },
              }
            },
            dispatch: jest.fn(),
          }
          window = {
            localStorage: {
              setItem: jest.fn(),
              getItem: jest.fn(() => null),
            },
          }
          window.self = window
          window.top = {}
        })
        it('should dispatch SET_ACCOUNT if account is stored in localStorage', () => {
          expect.assertions(2)
          window.localStorage.getItem = jest.fn(() => account)
          const middleware = interWindowCommunicationMiddleware(window)
          middleware(store)(() => {})({})

          expect(window.localStorage.getItem).toHaveBeenCalledWith(
            '__unlock__account__'
          )
          expect(store.dispatch).toHaveBeenCalledWith(
            setAccount({ address: account, fromLocalStorage: true })
          )
        })
        it('should not dispatch SET_ACCOUNT if localStorage does not have an account', () => {
          expect.assertions(2)
          const middleware = interWindowCommunicationMiddleware(window)
          middleware(store)(() => {})({})

          expect(window.localStorage.getItem).toHaveBeenCalledWith(
            '__unlock__account__'
          )
          expect(store.dispatch).not.toHaveBeenCalled()
        })
      })
    })
  })
  it('passes actions to the next middleware', () => {
    expect.assertions(1)
    const store = {
      getState() {
        return {
          router: {
            location: {
              pathname: '',
            },
          },
          account: {},
          modals: {},
        }
      },
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
