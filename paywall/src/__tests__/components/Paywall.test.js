import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../createUnlockStore'
import { Paywall, mapStateToProps } from '../../components/Paywall'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'
import { POST_MESSAGE_SCROLL_POSITION } from '../../paywall-builder/constants'
import { TRANSACTION_TYPES } from '../../constants'
import useOptimism from '../../hooks/useOptimism'

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

const keys = {
  aKey: {
    id: 'aKey',
    lock: lock.address,
    owner: account.address,
    expiration: futureDate,
  },
}
const modals = []
const transactions = {}

const store = createUnlockStore({
  account,
  locks,
  keys,
  modals,
  router,
  transactions,
})

function renderMockPaywall(props = {}) {
  return rtl.render(
    <ConfigContext.Provider value={config}>
      <WindowContext.Provider value={fakeWindow}>
        <Provider store={store}>
          <Paywall locks={[]} locked redirect={false} {...props} />
        </Provider>
      </WindowContext.Provider>
    </ConfigContext.Provider>
  )
}

function getPostmessageEventListener() {
  return fakeWindow.addEventListener.mock.calls[0][1]
}

afterEach(() => {
  rtl.cleanup()
})
describe('Paywall', () => {
  beforeEach(() => {
    config = { providers: [], isInIframe: true, requiredConfirmations: 12 }
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
      const props = mapStateToProps(
        {
          locks,
          keys,
          modals,
          router,
          account,
          transactions: {
            transaction: {
              id: 'transaction',
              type: TRANSACTION_TYPES.KEY_PURCHASE,
              key: 'aKey',
              lock: lock.address,
              confirmations: 3,
            },
          },
        },
        { config }
      )
      expect(props.locked).toBe(true)
    })

    it('should not be locked when there is a matching key and transaction is confirmed', () => {
      expect.assertions(1)
      const props = mapStateToProps(
        {
          locks,
          keys,
          modals,
          router,
          account,
          transactions: {
            transaction: {
              id: 'transaction',
              type: TRANSACTION_TYPES.KEY_PURCHASE,
              key: 'aKey',
              lock: lock.address,
              confirmations: 13,
            },
          },
        },
        { config }
      )
      expect(props.locked).toBe(false)
    })

    it('should not be locked when there is a matching key and no transaction', () => {
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
      expect(props.locked).toBe(false)
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
            },
          },
          modals,
          router,
          transactions: {
            '0x777': transaction,
          },
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
      let component
      rtl.act(() => {
        component = renderMockPaywall({ locks: [lock] })
      })
      const listener = getPostmessageEventListener()

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

  describe('handleIframe', () => {
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
    it('should post "unlocked" when it is unlocked in iframe', () => {
      expect.assertions(1)
      config.isInIframe = true
      rtl.act(() => {
        renderMockPaywall({ locked: false })
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
    it('should redirect with transaction hash if requested', () => {
      expect.assertions(1)

      rtl.act(() => {
        renderMockPaywall({
          locked: true,
          transaction: {
            status: 'pending',
            hash: 'hash',
          },
          redirect: 'http://example.com',
          account: 'account',
        })
      })

      expect(fakeWindow.location.href).toBe('http://example.com#hash')
    })
  })

  describe('on unlocking', () => {
    it('should redirect with account if requested', () => {
      expect.assertions(1)

      rtl.act(() => {
        renderMockPaywall({
          locked: false,
          redirect: 'http://example.com',
          account: 'account',
        })
      })

      expect(fakeWindow.location.href).toBe('http://example.com#account')
    })
    it('should redirect without account if requested', () => {
      expect.assertions(1)

      rtl.act(() => {
        renderMockPaywall({
          locked: false,
          redirect: 'http://example.com',
        })
      })

      expect(fakeWindow.location.href).toBe('http://example.com')
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
      const component = renderMockPaywall({ locked: true })

      const flagText = component.queryByTestId('unlocked')
      expect(flagText).toBeNull()
    })
  })
})
