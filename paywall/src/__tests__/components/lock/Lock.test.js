import React from 'react'
import * as rtl from 'react-testing-library'
import configure from '../../../config'
import { ConfigContext } from '../../../utils/withConfig'
import Lock from '../../../components/lock/Lock'
import usePurchaseKey from '../../../hooks/usePurchaseKey'

jest.mock('../../../hooks/usePurchaseKey')

const ConfigProvider = ConfigContext.Provider

describe('Lock', () => {
  describe('usePurchaseKey is called for purchases', () => {
    let purchase

    const lock = {
      address: '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e',
      name: 'Monthly',
      keyPrice: '0.23',
      fiatPrice: 240.38,
      expirationDuration: 2592000,
    }

    function renderMockLock(openInNewWindow) {
      const config = configure()
      config.isInIframe = true

      usePurchaseKey.mockImplementation(() => purchase)
      return rtl.render(
        <ConfigProvider value={config}>
          <Lock
            lock={lock}
            transaction={null}
            lockKey={null}
            purchaseKey={purchase}
            config={config}
            hideModal={() => {}}
            showModal={() => {}}
            openInNewWindow={openInNewWindow}
            requiredConfirmations={12}
            keyStatus="none"
          />
        </ConfigProvider>
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
