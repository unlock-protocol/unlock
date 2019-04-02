import { setAccount } from '../../actions/accounts'
import interWindowCommunicationMiddleware from '../../middlewares/interWindowCommunicationMiddleware'
import { updateKey, addKey } from '../../actions/key'

jest.mock('../../utils/localStorage')

describe('interWindowCommunicationMiddleware', () => {
  const lock = '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54'
  const account = '0xaaaaa25a3e7Fb15263D0DD455B8aAfc08503bb54'
  const transaction =
    '0x1234567890123456789012345678901234567890123456789012345678901234'

  describe('middleware functionality', () => {
    describe("running in the iframe inside the publisher's content window", () => {
      describe('no account present', () => {
        let state
        let store = {
          getState() {
            return state
          },
          dispatch: jest.fn(),
        }
        let window
        beforeEach(() => {
          state = {
            account: null,
            router: {
              location: {
                pathname: `/${lock}`,
                hash: '',
              },
            },
          }
          store.dispatch = jest.fn()
          window = {
            localStorage: {
              setItem: jest.fn(),
              getItem: jest.fn(() => null),
            },
          }
          window.self = window
          window.top = {}
        })

        describe('a transaction is passed in the URL hash', () => {
          beforeEach(() => {
            state = {
              account: null,
              router: {
                location: {
                  pathname: `/${lock}`,
                  hash: `#${transaction}`,
                },
              },
              transactions: {
                [transaction]: {
                  hash: transaction,
                  key: 'key',
                  lock: lock,
                },
              },
              keys: {
                key: {
                  id: 'key',
                  lock,
                  owner: account,
                },
              },
            }
          })

          it('UPDATE_KEY action', () => {
            expect.assertions(2)
            const middleware = interWindowCommunicationMiddleware(window)
            middleware(store)(() => {})(updateKey('key', { owner: account }))

            expect(window.localStorage.setItem).toHaveBeenCalledWith(
              '__unlock__account__',
              account
            )
            expect(store.dispatch).toHaveBeenCalledWith(
              expect.objectContaining(setAccount({ address: account }))
            )
          })

          it('ADD_KEY action', () => {
            expect.assertions(2)
            const middleware = interWindowCommunicationMiddleware(window)
            middleware(store)(() => {})(addKey('key', { owner: account }))

            expect(window.localStorage.setItem).toHaveBeenCalledWith(
              '__unlock__account__',
              account
            )
            expect(store.dispatch).toHaveBeenCalledWith(
              expect.objectContaining(setAccount({ address: account }))
            )
          })

          describe('sanity checking', () => {
            it.each([
              [
                'transaction is not set',
                {
                  transactions: {},
                },
              ],
              [
                'transaction lock does not match',
                {
                  transactions: {
                    [transaction]: {
                      lock: 'oops',
                      key: 'key',
                      hash: transaction,
                    },
                  },
                },
              ],
              [
                'transaction key does not match the action',
                {
                  transactions: {
                    [transaction]: {
                      lock,
                      key: 'oops',
                      hash: transaction,
                    },
                  },
                },
              ],
            ])('%s', (description, transactions) => {
              expect.assertions(2)

              state = {
                ...state,
                transactions,
              }
              const middleware = interWindowCommunicationMiddleware(window)
              middleware(store)(() => {})(addKey('key', { owner: account }))

              expect(window.localStorage.setItem).not.toHaveBeenCalled()
              expect(store.dispatch).not.toHaveBeenCalled()
            })
          })
        })

        describe('a transaction is not passed in the URL hash', () => {
          beforeEach(() => {
            state = {
              account: null,
              router: {
                location: {
                  pathname: `/${lock}`,
                  hash: '',
                },
              },
              transactions: {
                [transaction]: {
                  hash: transaction,
                  key: 'key',
                  lock: lock,
                },
              },
              keys: {
                key: {
                  id: 'key',
                  lock,
                  owner: account,
                },
              },
            }
          })

          it('UPDATE_KEY action', () => {
            expect.assertions(2)
            const middleware = interWindowCommunicationMiddleware(window)
            middleware(store)(() => {})(updateKey('key', { owner: account }))

            expect(window.localStorage.setItem).not.toHaveBeenCalled()
            expect(store.dispatch).not.toHaveBeenCalled()
          })

          it('ADD_KEY action', () => {
            expect.assertions(2)
            const middleware = interWindowCommunicationMiddleware(window)
            middleware(store)(() => {})(addKey('key', { owner: account }))

            expect(window.localStorage.setItem).not.toHaveBeenCalled()
            expect(store.dispatch).not.toHaveBeenCalled()
          })
        })

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
                      pathname: `/${lock}`,
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
                    pathname: `/${lock}`,
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
