import React from 'react'
import * as rtl from '@testing-library/react'
import {
  lockKeysAvailable,
  Lock,
} from '../../../../components/interface/checkout/Lock'
import * as usePurchaseKey from '../../../../hooks/usePurchaseKey'

describe('Checkout Lock', () => {
  describe('helpers', () => {
    describe('lockKeysAvailable', () => {
      it('returns Unlimited if it has unlimited keys', () => {
        expect.assertions(1)
        const lock = {
          unlimitedKeys: true,
          maxNumberOfKeys: -1,
          outstandingKeys: 100,
        }
        expect(lockKeysAvailable(lock)).toEqual('Unlimited')
      })

      it('returns the difference between max and outstanding ottherwise', () => {
        expect.assertions(1)
        const lock = {
          maxNumberOfKeys: 203,
          outstandingKeys: 100,
        }
        expect(lockKeysAvailable(lock)).toEqual('103')
      })
    })
  })

  describe('Lock', () => {
    let purchaseKey: () => void
    let setPurchasingLockAddress: () => void
    beforeEach(() => {
      purchaseKey = jest.fn()
      setPurchasingLockAddress = jest.fn()
      jest
        .spyOn(usePurchaseKey, 'usePurchaseKey')
        .mockImplementation(_ => ({ purchaseKey, initiatedPurchase: false }))
    })

    it('purchases a key and sets the purchasing address on click', () => {
      expect.assertions(2)

      const lock = {
        name: 'lock',
        address: '0xlockaddress',
        keyPrice: '4000000',
        expirationDuration: 50,
        currencyContractAddress: null,
      }

      const { getByText } = rtl.render(
        <Lock
          lock={lock}
          purchasingLockAddress={null}
          setPurchasingLockAddress={setPurchasingLockAddress}
        />
      )

      const validitySpan = getByText('Valid for')

      rtl.fireEvent.click(validitySpan)

      expect(purchaseKey).toHaveBeenCalled()
      expect(setPurchasingLockAddress).toHaveBeenCalledWith('0xlockaddress')
    })

    it('does not purchase a key and set the purchasing address when there is already a purchase', () => {
      expect.assertions(2)

      const lock = {
        name: 'lock',
        address: '0xlockaddress',
        keyPrice: '4000000',
        expirationDuration: 50,
        currencyContractAddress: null,
      }

      const { getByText } = rtl.render(
        <Lock
          lock={lock}
          purchasingLockAddress="0xneato"
          setPurchasingLockAddress={setPurchasingLockAddress}
        />
      )

      const validitySpan = getByText('Valid for')

      rtl.fireEvent.click(validitySpan)

      expect(purchaseKey).not.toHaveBeenCalled()
      expect(setPurchasingLockAddress).not.toHaveBeenCalled()
    })
  })
})
