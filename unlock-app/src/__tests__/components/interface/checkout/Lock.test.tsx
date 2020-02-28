import React from 'react'
import * as rtl from '@testing-library/react'
import { Lock } from '../../../../components/interface/checkout/Lock'
import * as usePurchaseKey from '../../../../hooks/usePurchaseKey'

const balances = {
  eth: '500.00',
}

const lock = {
  name: 'lock',
  address: '0xlockaddress',
  keyPrice: '0.04',
  expirationDuration: 50,
  currencyContractAddress: null,
}

describe('Checkout Lock', () => {
  describe('Lock', () => {
    let purchaseKey: () => void
    let setPurchasingLockAddress: () => void
    beforeEach(() => {
      purchaseKey = jest.fn()
      setPurchasingLockAddress = jest.fn()
      jest.spyOn(usePurchaseKey, 'usePurchaseKey').mockImplementation(_ => ({
        purchaseKey,
        initiatedPurchase: false,
        error: null,
        transactionHash: null,
      }))
    })

    it('purchases a key and sets the purchasing address on click', () => {
      expect.assertions(2)

      const { getByText } = rtl.render(
        <Lock
          lock={lock}
          purchasingLockAddress={null}
          setPurchasingLockAddress={setPurchasingLockAddress}
          balances={balances}
        />
      )

      const validitySpan = getByText('Valid for')

      rtl.fireEvent.click(validitySpan)

      expect(purchaseKey).toHaveBeenCalled()
      expect(setPurchasingLockAddress).toHaveBeenCalledWith('0xlockaddress')
    })

    it('does not purchase a key and set the purchasing address when there is already a purchase', () => {
      expect.assertions(2)

      const { getByText } = rtl.render(
        <Lock
          lock={lock}
          purchasingLockAddress="0xneato"
          setPurchasingLockAddress={setPurchasingLockAddress}
          balances={balances}
        />
      )

      const validitySpan = getByText('Valid for')

      rtl.fireEvent.click(validitySpan)

      expect(purchaseKey).not.toHaveBeenCalled()
      expect(setPurchasingLockAddress).not.toHaveBeenCalled()
    })

    it('renders an insufficient balance lock when the user cannot afford a key', () => {
      expect.assertions(0)

      const insufficientBalanceLock = {
        ...lock,
        currencyContractAddress: '0xcurrency',
      }

      const { getByTestId } = rtl.render(
        <Lock
          lock={insufficientBalanceLock}
          purchasingLockAddress={null}
          setPurchasingLockAddress={setPurchasingLockAddress}
          balances={balances}
        />
      )

      getByTestId('InsufficientBalanceLock')
    })

    it('renders a disabled lock when there is a purchase for a different lock', () => {
      expect.assertions(0)

      const { getByTestId } = rtl.render(
        <Lock
          lock={lock}
          purchasingLockAddress="0xneato"
          setPurchasingLockAddress={setPurchasingLockAddress}
          balances={balances}
        />
      )

      getByTestId('DisabledLock')
    })

    it('renders a processing lock when there is a purchase without transaction hash for this lock', () => {
      expect.assertions(0)

      const { getByTestId } = rtl.render(
        <Lock
          lock={lock}
          purchasingLockAddress="0xlockaddress"
          setPurchasingLockAddress={setPurchasingLockAddress}
          balances={balances}
        />
      )

      getByTestId('ProcessingLock')
    })

    it('renders a confirmed lock when there is a purchase with transaction hash for this lock', () => {
      expect.assertions(0)

      purchaseKey = jest.fn()
      setPurchasingLockAddress = jest.fn()
      jest.spyOn(usePurchaseKey, 'usePurchaseKey').mockImplementation(_ => ({
        purchaseKey,
        initiatedPurchase: false,
        error: null,
        transactionHash: '0xhash',
      }))

      const { getByTestId } = rtl.render(
        <Lock
          lock={lock}
          purchasingLockAddress="0xlockaddress"
          setPurchasingLockAddress={setPurchasingLockAddress}
          balances={balances}
        />
      )

      getByTestId('ConfirmedLock')
    })
  })
})
