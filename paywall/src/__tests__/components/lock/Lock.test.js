import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import { mapDispatchToProps, Lock } from '../../../components/lock/Lock'
import { purchaseKey } from '../../../actions/key'
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
            requiredConfirmations={12}
            keyStatus="none"
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
