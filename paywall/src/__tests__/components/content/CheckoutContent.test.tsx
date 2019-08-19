import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'
import CheckoutContent from '../../../components/content/CheckoutContent'
import { createUnlockStore } from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'

jest.mock('../../../hooks/utils/useConfig', () => {
  return () => ({
    requiredNetworkId: 1984,
  })
})

jest.mock('../../../hooks/useBlockchainData', () => {
  return () => ({
    account: {
      balance: '200',
      address: '0x123cdc',
    },
    network: 1984,
    locks: {
      '0x123abc': {
        name: 'My Lock',
        address: '0x123abc',
        keyPrice: '0.005',
        expirationDuration: 123456,
        key: {
          expiration: new Date().getMilliseconds(),
          transactions: [],
          status: 'whatever',
          confirmations: 0,
          lock: '0x123abc',
        },
      },
    },
  })
})

jest.mock('../../../hooks/usePaywallConfig', () => {
  return () => ({
    locks: {
      '0x123abc': {
        name: 'My Lock',
      },
    },
    callToAction: {
      default: 'This is a call to action',
    },
  })
})

const store = createUnlockStore()
const config = {
  erc20Contract: {
    address: '0xfeedbeef',
  },
}

describe('CheckoutContent', () => {
  it('shows the wallet check after the purchase button is clicked', () => {
    expect.assertions(1)
    const walletCheckMessage =
      'Please check your browser wallet to complete the transaction.'
    const { getByText } = rtl.render(
      <Provider store={store}>
        <ConfigContext.Provider value={config}>
          <CheckoutContent />
        </ConfigContext.Provider>
      </Provider>
    )

    // The message isn't there at first...
    expect(() => {
      getByText(walletCheckMessage)
    }).toThrow()
    const purchaseButton = getByText('Purchase')
    rtl.fireEvent.click(purchaseButton)

    // ...but then it is
    getByText(walletCheckMessage)
  })
})
