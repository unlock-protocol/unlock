import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../createUnlockStore'
import { setAccount } from '../../actions/accounts'
import Paywall, { mapStateToProps } from '../../components/Paywall'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'
import {
  POST_MESSAGE_SCROLL_POSITION,
  POST_MESSAGE_ACCOUNT,
} from '../../paywall-builder/constants'
import { TRANSACTION_TYPES } from '../../constants'
import useOptimism from '../../hooks/useOptimism'
import configure from '../../config'

jest.useFakeTimers()
jest.mock('../../hooks/useOptimism', () => {
  return jest.fn(() => ({ current: 1, past: 0 }))
})

const lock = { address: '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a' }
const locks = {
  [lock.address]: lock,
}
const router = {
  location: {
    pathname: `/paywall/${lock.address}/http%3a%2f%2fexample.com`,
    search: '?origin=http%3A%2F%2Fexample.com',
    hash: '',
  },
}

const noRedirectRouter = {
  location: {
    pathname: `/paywall/${lock.address}`,
    search: '?origin=http%3A%2F%2Fexample.com',
    hash: '',
  },
}

const account = { address: '0x1234567890123456789012345678901234567890' }

let fakeWindow
let config
let futureDate = new Date()
futureDate.setYear(futureDate.getFullYear() + 1)
futureDate = futureDate.getTime() / 1000

const key = {
  id: 'aKey',
  lock: lock.address,
  owner: account.address,
  expiration: futureDate,
}
const keys = {
  aKey: key,
}
const modals = []
const transactions = {}

let state = {
  account,
  locks,
  keys,
  modals,
  router,
  transactions,
}
let store = createUnlockStore(state)

function renderMockPaywall(props = {}) {
  return rtl.render(
    <ConfigContext.Provider value={config}>
      <WindowContext.Provider value={fakeWindow}>
        <Provider store={store}>
          <Paywall
            locks={[]}
            locked
            redirect={false}
            transaction={null}
            account={null}
            keyStatus="none"
            lockKey={{
              lock: 'lock',
              expiration: 12345,
            }}
            expiration=""
            {...props}
          />
        </Provider>
      </WindowContext.Provider>
    </ConfigContext.Provider>
  )
}

function getScrollPostmessageEventListener() {
  return fakeWindow.addEventListener.mock.calls[0][1]
}

function getAccountPostmessageEventListener() {
  return fakeWindow.addEventListener.mock.calls[1][1]
}

afterEach(() => {
  rtl.cleanup()
})
describe('Paywall', () => {
  beforeEach(() => {
    state = {
      account,
      locks,
      keys,
      modals,
      router,
      transactions,
    }
    store = createUnlockStore(state)
    config = configure()
    config.isInIframe = true
    fakeWindow = {
      location: {
        pathname: `/${lock.address}`,
        search: '?origin=http%3A%2F%2Fexample.com',
        hash: '',
      },
      parent: { postMessage: jest.fn() },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      document: {
        body: {
          style: {},
        },
      },
    }
  })
  describe('mapStateToProps', () => {
    it('should yield the lock which matches the address of the demo page', () => {
      expect.assertions(1)
      const props = mapStateToProps(
        {
          locks,
          keys,
          modals,
          router,
          account,
          transactions,
        },
        { config }
      )
      expect(props.locks[0]).toBe(lock)
    })

    it('should be locked when no keys are available', () => {
      expect.assertions(1)
      const props = mapStateToProps(
        {
          locks,
          keys: {},
          modals,
          router,
          account,
          transactions,
        },
        { config }
      )
      expect(props.locked).toBe(true)
    })

    it('should be locked when there is a matching key and transaction is not confirmed yet', () => {
      expect.assertions(1)
      const transactions = {
        transaction: {
          id: 'transaction',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: 'aKey',
          lock: lock.address,
          confirmations: 3,
        },
      }
      const props = mapStateToProps(
        {
          locks,
          keys: {
            aKey: {
              ...key,
              transactions,
            },
          },
          modals,
          router,
          account,
          transactions,
        },
        { config }
      )
      expect(props.locked).toBe(true)
    })

    it('should not be locked when there is a matching key and transaction is confirmed', () => {
      expect.assertions(1)
      const transactions = {
        transaction: {
          id: 'transaction',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: 'aKey',
          lock: lock.address,
          confirmations: 13,
          status: 'mined',
        },
      }
      const props = mapStateToProps(
        {
          locks,
          keys: {
            aKey: {
              ...key,
              transactions,
              expiration: new Date().getTime() / 1000 + 10000,
            },
          },
          modals,
          router,
          account,
          transactions,
        },
        { config }
      )
      expect(props.locked).toBe(false)
    })

    it('should be locked when there is a matching expired key and fully confirmed transaction', () => {
      expect.assertions(1)
      const transactions = {
        transaction: {
          id: 'transaction',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: 'aKey',
          lock: lock.address,
          confirmations: 13,
          status: 'mined',
        },
      }
      const props = mapStateToProps(
        {
          locks,
          keys: {
            aKey: {
              ...key,
              expiration: 1234,
              transactions,
            },
          },
          modals,
          router,
          account,
          transactions,
        },
        { config }
      )
      expect(props.locked).toBe(true)
    })

    it('should be locked and pull in the newest pending transaction with an expired key', () => {
      expect.assertions(2)
      const pendingTransaction = {
        id: 'pendingTransaction',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        key: 'aKey',
        lock: lock.address,
        confirmations: 13,
        status: 'pending',
        blockNumber: 500,
      }
      const transactions = {
        transaction: {
          id: 'transaction',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: 'aKey',
          lock: lock.address,
          confirmations: 13,
          status: 'mined',
          blockNumber: 1,
        },
        pendingTransaction,
      }
      const props = mapStateToProps(
        {
          locks,
          keys: {
            aKey: {
              ...key,
              expiration: 1234,
              transactions,
            },
          },
          modals,
          router,
          account,
          transactions,
        },
        { config }
      )
      expect(props.locked).toBe(true)
      expect(props.transaction).toBe(pendingTransaction)
    })

    it('should pass redirect if present in the URI', () => {
      expect.assertions(1)
      const props = mapStateToProps(
        {
          locks,
          keys,
          modals,
          router,
          account,
          transactions: {},
        },
        { config }
      )
      expect(props.redirect).toBe('http://example.com')
    })

    it('should not pass redirect if not present in the URI', () => {
      expect.assertions(1)
      const props = mapStateToProps(
        {
          locks,
          keys,
          modals,
          router: noRedirectRouter,
          account,
          transactions,
        },
        { config }
      )
      expect(props.redirect).toBeFalsy()
    })

    it('should pull the redirect parameter from the page', () => {
      expect.assertions(1)
      const lock = { address: '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a' }
      const locks = {
        [lock.address]: lock,
      }
      const router = {
        location: {
          pathname: `/paywall/${lock.address}/http%3A%2F%2Fexample.com`,
        },
      }
      const props = mapStateToProps(
        {
          locks,
          router,
          keys,
          modals,
          account,
          transactions,
        },
        { config }
      )
      expect(props.redirect).toBe('http://example.com')
    })

    it('should return the transaction if applicable', () => {
      expect.assertions(1)

      const transaction = {
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        status: 'pending',
        hash: '0x777',
        key: '0x123-0x456',
      }
      const transactions = {
        '0x777': transaction,
      }
      const newProps = mapStateToProps(
        {
          account: {
            address: '0x123',
          },
          locks,
          keys: {
            '0x123-0x456': {
              id: '0x123-0x456',
              lock: lock.address,
              owner: '0x123',
              expiration: 0,
              data: 'hello',
              transactions,
            },
          },
          modals,
          router,
          transactions,
        },
        { config }
      )
      expect(newProps.transaction).toEqual(transaction)
    })
  })

  describe('uses optimism', () => {
    beforeEach(() => {
      config = { providers: [], isInIframe: true }
      fakeWindow = {
        location: {
          pathname: `/${lock.address}`,
          search: '?origin=http%3A%2F%2Fexample.com',
          hash: '',
        },
        parent: { postMessage: jest.fn() },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        document: {
          body: {
            style: {},
          },
        },
      }
    })

    it('calls the useOptimism hook', () => {
      expect.assertions(1)
      renderMockPaywall({ locks: [lock] })

      expect(useOptimism).toHaveBeenCalled()
    })
  })

  describe('listen for scroll position', () => {
    it('should accept a scroll position that is a real number', () => {
      expect.assertions(1)
      key.expiration = 0
      store = createUnlockStore(state)
      let component
      rtl.act(() => {
        component = renderMockPaywall({ locks: [lock] }, true)
      })
      const listener = getScrollPostmessageEventListener()

      rtl.act(() => {
        listener({
          origin: 'http://example.com',
          source: fakeWindow.parent,
          data: { type: POST_MESSAGE_SCROLL_POSITION, payload: 1.23 },
        })
        jest.runAllTimers()
      })

      expect(component.getByTestId('paywall-banner').style.height).toBe('1.23%')
    })
  })

  describe('listen for account', () => {
    it('should accept account, and dispatch setAccount', () => {
      expect.assertions(1)

      const anotherAccount = '0x1234567890123456789012345678901234567890'
      state.account = {
        address: 'foobar',
        fromLocalStorage: true,
      }
      store = createUnlockStore(state)
      store.dispatch = jest.fn()
      rtl.act(() => {
        renderMockPaywall()
      })
      const listener = getAccountPostmessageEventListener()

      rtl.act(() => {
        listener({
          origin: 'http://example.com',
          source: fakeWindow.parent,
          data: { type: POST_MESSAGE_ACCOUNT, payload: anotherAccount },
        })
        jest.runAllTimers()
      })

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining(
          setAccount({
            address: anotherAccount,
            fromLocalStorage: true,
            fromMainWindow: true,
          })
        )
      )
    })

    it('should accept account, and dispatch setAccount if iframe has no account', () => {
      expect.assertions(1)

      const anotherAccount = '0x1234567890123456789012345678901234567890'
      state.account = null
      store = createUnlockStore(state)
      store.dispatch = jest.fn()
      rtl.act(() => {
        renderMockPaywall()
      })
      const listener = getAccountPostmessageEventListener()

      rtl.act(() => {
        listener({
          origin: 'http://example.com',
          source: fakeWindow.parent,
          data: { type: POST_MESSAGE_ACCOUNT, payload: anotherAccount },
        })
        jest.runAllTimers()
      })

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining(
          setAccount({
            address: anotherAccount,
            fromLocalStorage: true,
            fromMainWindow: true,
          })
        )
      )
    })

    it('should ignore account if it is unchanged', () => {
      expect.assertions(1)

      const anotherAccount = '0x1234567890123456789012345678901234567890'
      state.account = {
        address: anotherAccount,
        fromLocalStorage: true,
      }
      store = createUnlockStore(state)
      store.dispatch = jest.fn()
      rtl.act(() => {
        renderMockPaywall()
      })
      const listener = getAccountPostmessageEventListener()

      rtl.act(() => {
        listener({
          origin: 'http://example.com',
          source: fakeWindow.parent,
          data: { type: POST_MESSAGE_ACCOUNT, payload: anotherAccount },
        })
        jest.runAllTimers()
      })

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('handleIframe, locked', () => {
    beforeEach(() => {
      key.expiration = 0
      store = createUnlockStore(state)
    })
    it('should post "locked" when it is locked in iframe', () => {
      expect.assertions(1)
      config.isInIframe = true
      rtl.act(() => {
        renderMockPaywall()
      })

      expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
        'locked',
        'http://example.com'
      )
    })
    it('should not post any message when it is in the main window', () => {
      expect.assertions(1)
      config.isInIframe = false
      rtl.act(() => {
        renderMockPaywall()
      })

      expect(fakeWindow.parent.postMessage).not.toHaveBeenCalled()
    })
  })
  describe('handleIframe, unlocked', () => {
    beforeEach(() => {
      key.expiration = futureDate
      store = createUnlockStore(state)
    })

    it('should post "unlocked" when it is unlocked in iframe', () => {
      expect.assertions(1)
      config.isInIframe = true
      rtl.act(() => {
        renderMockPaywall()
      })

      expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
        'unlocked',
        'http://example.com'
      )
    })
    it('updating body css', () => {
      expect.assertions(1)

      config.isInIframe = true
      rtl.act(() => {
        renderMockPaywall({ locked: false })
      })

      expect(fakeWindow.document.body.className).toBe('small')
    })
  })

  describe('on pending transaction', () => {
    beforeEach(() => {
      store = createUnlockStore(state)
    })

    it('should redirect with transaction hash if requested', () => {
      expect.assertions(1)

      rtl.act(() => {
        renderMockPaywall()
      })

      expect(fakeWindow.location.href).toBe(
        'http://example.com#' + account.address
      )
    })
  })

  describe('on unlocking', () => {
    beforeEach(() => {
      store = createUnlockStore(state)
    })

    it('should redirect with account if requested', () => {
      expect.assertions(1)

      rtl.act(() => {
        renderMockPaywall({
          locked: false,
          redirect: 'http://example.com',
          account: 'account',
        })
      })

      expect(fakeWindow.location.href).toBe(
        'http://example.com#' + account.address
      )
    })
  })

  describe('the unlocked flag', () => {
    it('should be present when the paywall is unlocked', () => {
      expect.assertions(1)
      const component = renderMockPaywall({ locked: false })

      const flagText = component.getByTestId('unlocked')
      expect(flagText).not.toBeNull()
    })

    it('should not be present when the paywall is locked', () => {
      expect.assertions(1)
      key.expiration = 0
      store = createUnlockStore(state)
      const component = renderMockPaywall({ locked: true })

      const flagText = component.queryByTestId('unlocked')
      expect(flagText).toBeNull()
    })
  })
})
