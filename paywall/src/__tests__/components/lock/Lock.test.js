import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import {
  mapStateToProps,
  mapDispatchToProps,
  Lock,
} from '../../../components/lock/Lock'
import { purchaseKey } from '../../../actions/key'
import { TRANSACTION_TYPES } from '../../../constants'
import usePurchaseKey from '../../../hooks/usePurchaseKey'
import createUnlockStore from '../../../createUnlockStore'

jest.mock('../../../hooks/usePurchaseKey')
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

  describe('usePurchaseKey is called for purchases', () => {
    let purchase
    const config = {
      isInIframe: true,
      isServer: false,
      requiredConfirmations: 12,
    }

    const lock = {
      address: '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e',
      name: 'Monthly',
      keyPrice: '0.23',
      fiatPrice: 240.38,
      expirationDuration: 2592000,
    }

    function renderMockLock(openInNewWindow) {
      const state = {
        network: {},
        account: {
          address: '0x123',
        },
      }
      const store = createUnlockStore(state)

      usePurchaseKey.mockImplementation(() => purchase)
      return rtl.render(
        <Provider store={store}>
          <Lock
            lock={lock}
            transaction={null}
            lockKey={null}
            purchaseKey={purchaseKey}
            config={config}
            hideModal={() => {}}
            showModal={() => {}}
            openInNewWindow={openInNewWindow}
          />
        </Provider>
      )
    }
    it('should call useKeyPurchase purchase', () => {
      expect.assertions(1)
      purchase = jest.fn()
      const component = renderMockLock(true)

      rtl.act(() => {
        rtl.fireEvent.click(component.getByText('Monthly'))
      })

      expect(usePurchaseKey).toHaveBeenCalled()
    })
  })
})
