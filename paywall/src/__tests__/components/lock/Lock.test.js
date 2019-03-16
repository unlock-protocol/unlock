import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import Lock, {
  mapStateToProps,
  mapDispatchToProps,
} from '../../../components/lock/Lock'
import { purchaseKey } from '../../../actions/key'
import { TRANSACTION_TYPES } from '../../../constants'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'
import { WindowContext } from '../../../hooks/browser/useWindow'
import { POST_MESSAGE_REDIRECT } from '../../../paywall-builder/constants'

describe('Lock', () => {
  describe('mapDispatchToProps', () => {
    it('should return a purchaseKey function which when invoked dispatches purchaseKey and invokes showModal', () => {
      expect.assertions(2)
      const dispatch = jest.fn()
      const props = {
        showModal: jest.fn(),
      }
      const key = {}

      const newProps = mapDispatchToProps(dispatch, props)

      newProps.purchaseKey(key)
      expect(props.showModal).toHaveBeenCalledWith()
      expect(dispatch).toHaveBeenCalledWith(purchaseKey(key))
    })
  })

  describe('mapStateToProps', () => {
    it('should return a new lockKey and no transaction when there is no matching key', () => {
      expect.assertions(5)
      const state = {
        network: {},
        account: {
          address: '0x123',
        },
        keys: [],
        transactions: {},
      }
      const props = {
        lock: {
          address: '0xdeadbeef',
        },
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.lockKey.lock).toEqual(props.lock.address)
      expect(newProps.lockKey.owner).toEqual(state.account.address)
      expect(newProps.lockKey.data).toEqual(undefined)
      expect(newProps.lockKey.expiration).toEqual(undefined)
      expect(newProps.transaction).toEqual(undefined) // Array::find will return undefined if no item is matched
    })

    it('should return the lockKey and its transaction if applicable', () => {
      expect.assertions(5)
      const props = {
        lock: {
          address: '0xdeadbeef',
        },
      }

      const state = {
        network: {},
        account: {
          address: '0x123',
        },
        keys: {
          '0x123-0x456': {
            id: '0x123-0x456',
            lock: props.lock.address,
            owner: '0x123',
            expiration: 1000,
            data: 'hello',
          },
        },
        transactions: {
          '0x777': {
            type: TRANSACTION_TYPES.KEY_PURCHASE,
            status: 'pending',
            hash: '0x777',
            key: '0x123-0x456',
          },
        },
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.lockKey.lock).toEqual(props.lock.address)
      expect(newProps.lockKey.owner).toEqual(state.account.address)
      expect(newProps.lockKey.data).toEqual('hello')
      expect(newProps.lockKey.expiration).toEqual(1000)
      expect(newProps.transaction).toEqual(state.transactions['0x777'])
    })
  })
  describe('Purchase key behavior in an iframe', () => {
    let fakeWindow
    let state
    let config
    let store
    let hideModal
    let showModal

    const lock = {
      address: '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e',
      name: 'Monthly',
      keyPrice: '0.23',
      fiatPrice: 240.38,
      expirationDuration: 2592000,
    }

    function renderMockLock(openInNewWindow) {
      store = createUnlockStore(state)
      store.dispatch = jest.fn()
      return rtl.render(
        <Provider store={store}>
          <ConfigContext.Provider value={config}>
            <WindowContext.Provider value={fakeWindow}>
              <Lock
                lock={lock}
                transaction={null}
                lockKey={null}
                purchaseKey={purchaseKey}
                config={config}
                hideModal={hideModal}
                showModal={showModal}
                openInNewWindow={openInNewWindow}
              />
            </WindowContext.Provider>
          </ConfigContext.Provider>
        </Provider>
      )
    }
    beforeEach(() => {
      hideModal = jest.fn()
      showModal = jest.fn()
      fakeWindow = {
        parent: {
          postMessage: jest.fn(),
        },
        location: {
          pathname: `/${lock.address}`,
          search: '?origin=origin',
          hash: '',
        },
      }
      config = {
        isInIframe: true,
        isServer: false,
        requiredConfirmations: 12,
      }
      state = {
        network: {},
        account: {
          address: '0x123',
        },
      }
    })
    describe('no user account', () => {
      it('should try to open a new window via postMessage', () => {
        expect.assertions(3)
        state.account = null
        const component = renderMockLock(true)

        rtl.act(() => {
          rtl.fireEvent.click(component.getByText('Monthly'))
        })

        expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
          POST_MESSAGE_REDIRECT,
          'origin'
        )
        expect(showModal).not.toHaveBeenCalled()
        expect(store.dispatch).not.toHaveBeenCalled()
      })
    })
    describe('has user account', () => {
      it('should dispatch an action to purchase', () => {
        expect.assertions(3)
        const component = renderMockLock(false)

        rtl.fireEvent.click(component.getByText('Monthly'))

        const expectedAction = purchaseKey({
          lock: lock.address,
          owner: state.account.address,
        })
        expect(fakeWindow.parent.postMessage).not.toHaveBeenCalled()
        expect(showModal).toHaveBeenCalled()
        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining(expectedAction)
        )
      })
    })
  })
})
