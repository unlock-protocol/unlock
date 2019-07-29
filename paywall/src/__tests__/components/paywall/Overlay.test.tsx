import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import configure from '../../../config'

import Overlay, { displayError } from '../../../components/paywall/Overlay'
import { GlobalErrorContext } from '../../../utils/GlobalErrorProvider'
import { FATAL_NO_USER_ACCOUNT, FATAL_MISSING_PROVIDER } from '../../../errors'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'
import { WindowContext } from '../../../hooks/browser/useWindow'
import {
  POST_MESSAGE_GET_OPTIMISTIC,
  POST_MESSAGE_GET_PESSIMISTIC,
} from '../../../paywall-builder/constants'
import {
  Lock,
  Key,
  UnlockConfig,
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../../../unlockTypes'
import { KeyStatus } from '../../../selectors/keys'

const ErrorProvider = GlobalErrorContext.Provider
const ConfigProvider = ConfigContext.Provider

describe('Overlay', () => {
  const account = { address: '0x123', balance: '0' }
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
    const lock: Lock = {
      key: {
        lock: '0xdeadbeef',
        owner: '0x123',
        expiration: 0,
        confirmations: 0,
        status: 'none',
        transactions: [],
      },
      currencyContractAddress: null,
      name: 'Monthly',
      address: '0xdeadbeef',
      keyPrice: '100000',
      expirationDuration: 123456789,
    }
    const lockKey: Key = {
      confirmations: 0,
      status: 'valid',
      transactions: [],
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
    }
    let store: any
    beforeEach(() => (store = createUnlockStore()))

    it('displays lock when there is no error', () => {
      expect.assertions(3)
      let config: UnlockConfig = configure() as UnlockConfig
      config.isInIframe = true
      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: false, errorMetadata: {} }}>
              <Overlay
                account={account}
                config={config}
                scrollPosition={0}
                hideModal={() => {}}
                purchaseKey={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                keyStatus={KeyStatus.NONE}
                lockKey={lockKey}
                openInNewWindow
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
      let config = configure() as UnlockConfig
      config.isInIframe = true
      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: 'foobar', errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                account={account}
                config={config}
                purchaseKey={() => {}}
                keyStatus={KeyStatus.NONE}
                lockKey={lockKey}
                openInNewWindow
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
      let config = configure() as UnlockConfig
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
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                openInNewWindow={false}
                lockKey={lockKey}
                account={account}
                config={config}
                purchaseKey={() => {}}
                keyStatus={KeyStatus.NONE}
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
    const lock: Lock = {
      name: 'Monthly',
      address: '0xdeadbeef',
      keyPrice: '100000',
      expirationDuration: 123456789,
      currencyContractAddress: null,
      key: {
        lock: '0xdeadbeef',
        owner: account.address,
        expiration: 0,
        confirmations: 0,
        status: KeyStatus.NONE,
        transactions: [],
      },
    }
    const lockKey: Key = {
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
      transactions: [],
      status: KeyStatus.CONFIRMING,
      confirmations: 4,
    }
    let state: any
    let transaction: Transaction
    beforeEach(() => {
      transaction = {
        hash: 'hash',
        blockNumber: 123,
        status: TransactionStatus.MINED,
        key: 'key',
        confirmations: 4,
        type: TransactionType.KEY_PURCHASE,
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
      let config = configure() as UnlockConfig
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 1, past: 0 }}
                locks={[lock]}
                lockKey={lockKey}
                transaction={transaction}
                openInNewWindow={false}
                account={account}
                config={config}
                purchaseKey={() => {}}
                keyStatus={KeyStatus.CONFIRMING}
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
      let config = configure() as UnlockConfig
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 1, past: 0 }}
                locks={[lock]}
                lockKey={lockKey}
                transaction={transaction}
                openInNewWindow={false}
                account={account}
                purchaseKey={() => {}}
                keyStatus={KeyStatus.VALID}
                config={config}
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
      let config = configure() as UnlockConfig
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
                    smallBody={smallBody}
                    bigBody={() => {}}
                    optimism={{ current: 1, past: 0 }}
                    locks={[lock]}
                    lockKey={lockKey}
                    transaction={transaction}
                    openInNewWindow={false}
                    account={account}
                    purchaseKey={() => {}}
                    keyStatus={KeyStatus.CONFIRMING}
                    config={config}
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

      let config = configure() as UnlockConfig
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
                    bigBody={bigBody}
                    optimism={{ current: 0, past: 0 }}
                    locks={[lock]}
                    lockKey={lockKey}
                    transaction={transaction}
                    smallBody={() => {}}
                    openInNewWindow={false}
                    account={account}
                    purchaseKey={() => {}}
                    keyStatus={KeyStatus.CONFIRMING}
                    config={config}
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
    const lock: Lock = {
      name: 'Monthly',
      address: '0xdeadbeef',
      keyPrice: '100000',
      expirationDuration: 123456789,
      currencyContractAddress: null,
      key: {
        lock: '0xdeadbeef',
        owner: account.address,
        expiration: 0,
        confirmations: 0,
        status: KeyStatus.NONE,
        transactions: [],
      },
    }
    const lockKey: Key = {
      lock: 'lock',
      owner: 'account',
      expiration: new Date().getTime() / 1000 + 10000,
      transactions: [],
      status: KeyStatus.CONFIRMING,
      confirmations: 4,
    }
    let state: any
    let transaction: Transaction
    beforeEach(() => {
      transaction = {
        hash: 'hash',
        blockNumber: 123,
        key: 'key',
        status: TransactionStatus.MINED,
        confirmations: 4,
        type: TransactionType.KEY_PURCHASE,
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
      let config = configure() as UnlockConfig
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                lockKey={lockKey}
                transaction={transaction}
                openInNewWindow={false}
                account={account}
                purchaseKey={() => {}}
                keyStatus={KeyStatus.NONE}
                config={config}
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
      let config = configure() as UnlockConfig
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                lockKey={lockKey}
                transaction={transaction}
                openInNewWindow={false}
                account={account}
                purchaseKey={() => {}}
                keyStatus={KeyStatus.CONFIRMING}
                config={config}
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
      let config = configure() as UnlockConfig
      config.isInIframe = true

      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <ErrorProvider value={{ error: null, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                optimism={{ current: 0, past: 0 }}
                locks={[lock]}
                lockKey={lockKey}
                transaction={transaction}
                openInNewWindow={false}
                account={account}
                purchaseKey={() => {}}
                keyStatus={KeyStatus.VALID}
                config={config}
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
