import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../createUnlockStore'
import { Paywall, mapStateToProps } from '../../components/Paywall'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'

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

let fakeWindow
let config
let futureDate = new Date()
futureDate.setYear(futureDate.getFullYear() + 1)
futureDate = futureDate.getTime() / 1000

const keys = {
  aKey: {
    lock: lock.address,
    expiration: futureDate,
  },
}
const modals = []

const store = createUnlockStore({ locks, keys, modals, router })

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

afterEach(() => {
  rtl.cleanup()
})
describe('Paywall', () => {
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
    }
  })
  describe('mapStateToProps', () => {
    it('should yield the lock which matches the address of the demo page', () => {
      expect.assertions(1)
      const props = mapStateToProps({ locks, keys, modals, router })
      expect(props.locks[0]).toBe(lock)
    })

    it('should be locked when no keys are available', () => {
      expect.assertions(1)
      const props = mapStateToProps({ locks, keys: {}, modals, router })
      expect(props.locked).toBe(true)
    })

    it('should not be locked when there is a matching key', () => {
      expect.assertions(1)
      const props = mapStateToProps({ locks, keys, modals, router })
      expect(props.locked).toBe(false)
    })

    it('should pass redirect if present in the URI', () => {
      expect.assertions(1)
      const props = mapStateToProps({ locks, keys, modals, router })
      expect(props.redirect).toBe('http://example.com')
    })

    it('should not pass redirect if not present in the URI', () => {
      expect.assertions(1)
      const props = mapStateToProps({
        locks,
        keys,
        modals,
        router: noRedirectRouter,
      })
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
      const props = mapStateToProps({ locks, router, keys, modals })
      expect(props.redirect).toBe('http://example.com')
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
  })

  describe('the unlocked flag', () => {
    it('should be present when the paywall is unlocked', () => {
      expect.assertions(1)
      const { queryByText } = renderMockPaywall({ locked: false })

      const flagText = queryByText('Subscribed with Unlock')
      expect(flagText).not.toBeNull()
    })

    it('should not be present when the paywall is locked', () => {
      expect.assertions(1)
      const { queryByText } = renderMockPaywall({ locked: true })

      const flagText = queryByText('Subscribed with Unlock')
      expect(flagText).toBeNull()
    })
  })
})
