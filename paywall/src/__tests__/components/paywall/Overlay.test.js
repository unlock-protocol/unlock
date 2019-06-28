import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import configure from '../../../config'
import { SHOW_MODAL, HIDE_MODAL } from '../../../actions/modal'

import Overlay, {
  mapDispatchToProps,
  mapStateToProps,
  displayError,
} from '../../../components/lock/Overlay'
import { GlobalErrorContext } from '../../../utils/GlobalErrorProvider'
import { FATAL_NO_USER_ACCOUNT, FATAL_MISSING_PROVIDER } from '../../../errors'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'
import { TRANSACTION_TYPES } from '../../../constants'
import { WindowContext } from '../../../hooks/browser/useWindow'
import {
  POST_MESSAGE_GET_OPTIMISTIC,
  POST_MESSAGE_GET_PESSIMISTIC,
} from '../../../paywall-builder/constants'

const ErrorProvider = GlobalErrorContext.Provider
const ConfigProvider = ConfigContext.Provider

describe('Overlay', () => {
  describe('mapDispatchToProps', () => {
    it('should yield a prop function which dispatches hideModal with the right value', () => {
      expect.assertions(2)
      const locks = [{ address: '0x123' }, { address: '0x456' }]
      const dispatch = jest.fn()
      const props = mapDispatchToProps(dispatch, { locks })
      props.hideModal()
      expect(dispatch).toHaveBeenCalledWith({
        modal: '0x123-0x456',
        type: HIDE_MODAL,
      })
      props.showModal()
      expect(dispatch).toHaveBeenCalledWith({
        modal: '0x123-0x456',
        type: SHOW_MODAL,
      })
    })
  })

  describe('mapStateToProps', () => {
    it('should set openInNewWindow based on the value of account', () => {
      expect.assertions(3)

      const props = {
        locks: [
          {
            address: '0x123',
          },
        ],
      }
      const state1 = {
        account: null,
      }
      const state2 = {
        account: {
          address: 'account',
        },
        keys: {
          key: {
            lock: '0x123',
            owner: 'account',
            id: 'key',
          },
        },
        transactions: {},
      }
      const state3 = {
        account: {
          address: 'account',
          fromLocalStorage: true,
        },
        keys: {
          key: {
            lock: '0x123',
            owner: 'account',
            id: 'key',
          },
        },
        transactions: {},
      }

      expect(mapStateToProps(state1, props)).toEqual({
        openInNewWindow: true,
      })

      expect(mapStateToProps(state2, props)).toEqual({
        openInNewWindow: false,
      })

      expect(mapStateToProps(state3, props)).toEqual({
        openInNewWindow: true,
      })
    })
  })

  describe('displayError', () => {
    it('should display children if there is no error', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(true /* isMainWindow */)(false, {}, <div>children</div>)
      )

      expect(wrapper.getByText('children')).not.toBeNull()
    })

    it('should display error', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(true /* isMainWindow */)('foobar', {}, <div>children</div>)
      )

      expect(wrapper.getByText('Fatal Error')).not.toBeNull()
    })

    it('should display children if provider is missing and in the iframe', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(false /* iframe */)(
          FATAL_MISSING_PROVIDER,
          {},
          <div>children</div>
        )
      )

      expect(wrapper.queryByText('Wallet missing')).toBeNull()
    })

    it('should display error if provider is missing and in the main window', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(true /* isMainWindow */)(
          FATAL_MISSING_PROVIDER,
          {},
          <div>children</div>
        )
      )

      expect(wrapper.getByText('Wallet missing')).not.toBeNull()
    })

    it('should display children if account is missing and in the iframe', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(false /* iframe */)(
          FATAL_NO_USER_ACCOUNT,
          {},
          <div>children</div>
        )
      )

      expect(wrapper.queryByText('error')).toBeNull()
    })

    it('should display error if account is missing and in the main window', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(true /* isMainWindow */)(
          FATAL_NO_USER_ACCOUNT,
          {},
          <div>children</div>
        )
      )

      expect(wrapper.getByText('Need account')).not.toBeNull()
    })
  })

  describe('error replacement', () => {
    const lock = {
      id: 'lock',
      name: 'Monthly',
      address: '0xdeadbeef',
      keyPrice: '100000',
      expirationDuration: 123456789,
    }
    const lockKey = {
      id: 'key',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
    }
    let store
    beforeEach(() => (store = createUnlockStore()))

    it('displays lock when there is no error', () => {
      expect.assertions(3)
      let config = configure()
      config.isInIframe = true
      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: false, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                keyStatus="none"
                lockKey={lockKey}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.getByText('100k Eth')).not.toBeNull()
      expect(wrapper.getByText('Powered by')).not.toBeNull()
      expect(
        wrapper.queryByText(
          'You have reached your limit of free articles. Please purchase access'
        )
      ).not.toBeNull()
    })

    it('displays error, headline, and flag when there is an error', () => {
      expect.assertions(3)
      let config = configure()
      config.isInIframe = true
      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: 'foobar', errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                keyStatus="none"
                lockKey={lockKey}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.queryByText('100k Eth')).toBeNull()
      expect(wrapper.getByText('Powered by')).not.toBeNull()
      expect(
        wrapper.queryByText(
          'You have reached your limit of free articles. Please purchase access'
        )
      ).not.toBeNull()
    })

    it('displays lock when the error is missing account', () => {
      expect.assertions(3)
      let config = configure()
      config.isInIframe = true
      const wrapper = rtl.render(
        <Provider store={store}>
          <ErrorProvider
            value={{ error: FATAL_NO_USER_ACCOUNT, errorMetadata: {} }}
          >
            <ConfigProvider value={config}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                openInNewWindow={false}
                keyStatus="none"
                lockKey={lockKey}
              />
            </ConfigProvider>
          </ErrorProvider>
        </Provider>
      )

      expect(wrapper.getByText('100k Eth')).not.toBeNull()
      expect(wrapper.getByText('Powered by')).not.toBeNull()
      expect(
        wrapper.getByText(
          'You have reached your limit of free articles. Please purchase access'
        )
      ).not.toBeNull()
    })
  })

  describe('Optimistic unlocking', () => {
    const lock = {
      name: 'Monthly',
      address: '0xdeadbeef',
      keyPrice: '100000',
      expirationDuration: 123456789,
    }
    const lockKey = {
      id: 'key',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
    }
    let state
    let transaction
    beforeEach(() => {
      transaction = {
        key: 'key',
        confirmations: 4,
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      state = {
        account: {
          address: 'account',
        },
        keys: {
          key: {
            lock: '0xdeadbeef',
            owner: 'account',
            id: 'key',
          },
        },
        transactions: {
          transaction,
        },
      }
    })

    it('shows nothing if optimism is high', () => {
      expect.assertions(1)

      const store = createUnlockStore(state)
      let config = configure()
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 1, past: 0 }}
                locks={[lock]}
                keyStatus="confirming"
                lockKey={lockKey}
                transaction={transaction}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.queryByText('Confirming Purchase')).toBeNull()
    })

    it('shows nothing if optimism is high and confirmations are high enough', () => {
      expect.assertions(1)

      state.transactions.transaction.confirmations = 13
      const store = createUnlockStore(state)
      let config = configure()
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 1, past: 0 }}
                locks={[lock]}
                keyStatus="valid"
                lockKey={lockKey}
                transaction={transaction}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.queryByText('Purchase Confirmed')).toBeNull()
    })

    it('sends POST_MESSAGE_OPTIMISTIC and calls smallBody if confirming and optimistic', () => {
      expect.assertions(2)

      const store = createUnlockStore(state)
      const smallBody = jest.fn()
      const fakeWindow = {
        location: {
          pathname: '/0x1234567890123456789012345678901234567890',
          search: '?origin=http%3A%2F%2Fexample.com',
          hash: '',
        },
        parent: {
          postMessage: jest.fn(),
        },
      }
      let config = configure()
      config.isInIframe = true
      config.isServer = false

      rtl.act(() => {
        rtl.render(
          <Provider store={store}>
            <WindowContext.Provider value={fakeWindow}>
              <ConfigProvider value={config}>
                <ErrorProvider value={{ error: null, errorMetadata: {} }}>
                  <Overlay
                    scrollPosition={0}
                    hideModal={() => {}}
                    showModal={() => {}}
                    smallBody={smallBody}
                    bigBody={() => {}}
                    optimism={{ current: 1, past: 0 }}
                    locks={[lock]}
                    keyStatus="confirming"
                    lockKey={lockKey}
                    transaction={transaction}
                  />
                </ErrorProvider>
              </ConfigProvider>
            </WindowContext.Provider>
          </Provider>
        )
      })

      expect(smallBody).toHaveBeenCalled()
      expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
        POST_MESSAGE_GET_OPTIMISTIC,
        'http://example.com'
      )
    })

    it('sends POST_MESSAGE_PESSIMISTIC and calls bigBody if not optimistic', () => {
      expect.assertions(2)

      const store = createUnlockStore(state)
      const bigBody = jest.fn()
      const fakeWindow = {
        location: {
          pathname: '/0x1234567890123456789012345678901234567890',
          search: '?origin=http%3A%2F%2Fexample.com',
          hash: '',
        },
        parent: {
          postMessage: jest.fn(),
        },
      }

      let config = configure()
      config.isInIframe = true

      rtl.act(() => {
        rtl.render(
          <WindowContext.Provider value={fakeWindow}>
            <Provider store={store}>
              <ConfigProvider value={config}>
                <ErrorProvider value={{ error: null, errorMetadata: {} }}>
                  <Overlay
                    scrollPosition={0}
                    hideModal={() => {}}
                    showModal={() => {}}
                    smallBody={() => {}}
                    bigBody={bigBody}
                    optimism={{ current: 0, past: 0 }}
                    locks={[lock]}
                    keyStatus="confirming"
                    lockKey={lockKey}
                    transaction={transaction}
                  />
                </ErrorProvider>
              </ConfigProvider>
            </Provider>
          </WindowContext.Provider>
        )
      })

      expect(bigBody).toHaveBeenCalled()
      expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
        POST_MESSAGE_GET_PESSIMISTIC,
        'http://example.com'
      )
    })
  })

  describe('message displayed to user (pessimistic unlocking)', () => {
    const lock = {
      name: 'Monthly',
      address: '0xdeadbeef',
      keyPrice: '100000',
      expirationDuration: 123456789,
    }
    const lockKey = {
      id: 'key',
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
    }
    let state
    let transaction
    beforeEach(() => {
      transaction = {
        key: 'key',
        status: 'mined',
        confirmations: 4,
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      const transactions = {
        transaction,
      }
      state = {
        account: {
          address: 'account',
        },
        keys: {
          key: {
            lock: '0xdeadbeef',
            owner: 'account',
            id: 'key',
            transactions,
          },
        },
        transactions,
      }
    })

    it('should show limit message when purchase has not started', () => {
      expect.assertions(2)

      const store = createUnlockStore()
      let config = configure()
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                keyStatus="none"
                lockKey={lockKey}
                transaction={transaction}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.getByText('100k Eth')).not.toBeNull()
      expect(
        wrapper.getByText(
          'You have reached your limit of free articles. Please purchase access'
        )
      ).not.toBeNull()
    })

    it('should show pending message while transaction is confirming', () => {
      expect.assertions(2)

      const store = createUnlockStore(state)
      let config = configure()
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                keyStatus="confirming"
                lockKey={lockKey}
                transaction={transaction}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.getByText('100k Eth')).not.toBeNull()
      expect(wrapper.getByText('Purchase pending...')).not.toBeNull()
    })

    it('should show confirmed message when transaction is confirmed', () => {
      expect.assertions(2)

      state.transactions.transaction.confirmations = 123
      const store = createUnlockStore(state)
      let config = configure()
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                keyStatus="valid"
                lockKey={lockKey}
                transaction={transaction}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.getByText('100k Eth')).not.toBeNull()
      expect(
        wrapper.getByText('Purchase confirmed, content unlocked!')
      ).not.toBeNull()
    })
  })
})
