import React from 'react'
import * as rtl from '@testing-library/react'
import {
  reducer,
  CheckoutStoreProvider,
  useCheckoutStore,
} from '../../hooks/useCheckoutStore'
import {
  setPurchasingLockAddress,
  setTransactionHash,
  setDelayedPurchase,
} from '../../utils/checkoutActions'

const newDelayedPurchase = {
  lockAddress: '0xalock',
  purchaseKey: jest.fn(),
}

describe('useCheckoutStore -- reducer', () => {
  it('returns the state updated with a new purchasing address on setPurchasingLockAddress', () => {
    expect.assertions(1)

    const newAddress = '0xthenewaddress'

    expect(reducer(undefined, setPurchasingLockAddress(newAddress))).toEqual(
      expect.objectContaining({
        purchasingLockAddress: newAddress,
      })
    )
  })

  it('returns the state updated with a new transaction hash on setTransactionHash', () => {
    expect.assertions(1)

    const transactionHash = '0xthehash'

    expect(reducer(undefined, setTransactionHash(transactionHash))).toEqual(
      expect.objectContaining({
        transactionHash,
      })
    )
  })

  it('returns the state updated with a new delayed purchase on setDelayedPurchase', () => {
    expect.assertions(1)

    expect(reducer(undefined, setDelayedPurchase(newDelayedPurchase))).toEqual(
      expect.objectContaining({
        delayedPurchase: newDelayedPurchase,
      })
    )
  })
})

describe('useCheckoutStore -- CheckoutStoreProvider', () => {
  it('renders and provides a store', () => {
    expect.assertions(0)

    const Consumer = () => {
      useCheckoutStore()

      return <div />
    }

    rtl.render(
      <CheckoutStoreProvider>
        <Consumer />
      </CheckoutStoreProvider>
    )
  })
})
