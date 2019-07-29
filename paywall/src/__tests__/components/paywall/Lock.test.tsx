import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import configure from '../../../config'
import { ConfigContext } from '../../../utils/withConfig'
import Lock from '../../../components/paywall/Lock'
import usePurchaseKey from '../../../hooks/usePurchaseKey'
import createUnlockStore from '../../../createUnlockStore'
import { Lock as LockType } from '../../../unlockTypes'

jest.mock('../../../hooks/usePurchaseKey')

const ConfigProvider = ConfigContext.Provider

describe('Lock', () => {
  describe('usePurchaseKey is called for purchases', () => {
    let purchase: () => void
    const lockAddress = '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e'

    const lock: LockType = {
      address: lockAddress,
      name: 'Monthly',
      keyPrice: '0.23',
      expirationDuration: 2592000,
      key: {
        owner: '0x123',
        expiration: 0,
        confirmations: 0,
        lock: lockAddress,
        status: 'none',
        transactions: [],
      },
      currencyContractAddress: null,
    }

    function renderMockLock(openInNewWindow: boolean = false) {
      const state = {
        network: {},
        account: {
          address: '0x123',
        },
      }
      const config = configure()
      config.isInIframe = true

      purchase = jest.fn()
      const store = createUnlockStore(state)
      ;(usePurchaseKey as any).mockImplementation(() => purchase)
      return rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <Lock
              account={{ address: '0x123', balance: '0' }}
              lock={lock}
              purchaseKey={purchase}
              hideModal={() => {}}
              openInNewWindow={openInNewWindow}
              keyStatus="none"
            />
          </ConfigProvider>
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
