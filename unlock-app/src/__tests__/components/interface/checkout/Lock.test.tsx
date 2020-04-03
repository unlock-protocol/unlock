import React from 'react'
import * as rtl from '@testing-library/react'
import { KeyResult } from '@unlock-protocol/unlock-js'
import { Lock } from '../../../../components/interface/checkout/Lock'
import * as usePurchaseKey from '../../../../hooks/usePurchaseKey'
import { TransactionInfo } from '../../../../hooks/useCheckoutCommunication'
import * as CheckoutStoreModule from '../../../../hooks/useCheckoutStore'
import {
  setPurchasingLockAddress,
  setDelayedPurchase,
} from '../../../../utils/checkoutActions'

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

const activeKeyForThisLock: KeyResult = {
  lock: '0xlockaddress',
  owner: '0xme',
  expiration: 512345555,
}

const activeKeyForAnotherLock: KeyResult = {
  ...activeKeyForThisLock,
  lock: '0xanotherlockaddress',
}

const accountAddress = '0xuser'

describe('Checkout Lock', () => {
  describe('Lock', () => {
    let purchaseKey: () => void
    let emitTransactionInfo: (info: TransactionInfo) => void
    let state: any
    let dispatch: jest.Mock<any, any>
    let showMetadataForm: jest.Mock<any, any>
    beforeEach(() => {
      purchaseKey = jest.fn()
      emitTransactionInfo = jest.fn()
      state = {}
      dispatch = jest.fn()
      showMetadataForm = jest.fn()

      jest
        .spyOn(CheckoutStoreModule, 'useCheckoutStore')
        .mockImplementation(() => ({ state, dispatch }))

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
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[]}
          accountAddress={accountAddress}
          showMetadataForm={showMetadataForm}
        />
      )

      const validitySpan = getByText('Valid for')

      rtl.fireEvent.click(validitySpan)

      expect(purchaseKey).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledWith(
        setPurchasingLockAddress('0xlockaddress')
      )
    })

    it('delays the purchase and shows metadata form when metadata is required', () => {
      expect.assertions(2)

      const { getByText } = rtl.render(
        <Lock
          lock={lock}
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[]}
          accountAddress={accountAddress}
          metadataRequired
          showMetadataForm={showMetadataForm}
        />
      )

      const validitySpan = getByText('Valid for')

      rtl.fireEvent.click(validitySpan)

      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        setDelayedPurchase({
          lockAddress: '0xlockaddress',
          purchaseKey: expect.any(Function),
        })
      )
      expect(showMetadataForm).toHaveBeenCalled()
    })

    it('does not purchase a key and set the purchasing address when there is already a purchase', () => {
      expect.assertions(2)

      state.purchasingLockAddress = '0xapurchase'

      const { getByText } = rtl.render(
        <Lock
          lock={lock}
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[]}
          accountAddress={accountAddress}
          showMetadataForm={showMetadataForm}
        />
      )

      const validitySpan = getByText('Valid for')

      rtl.fireEvent.click(validitySpan)

      expect(purchaseKey).not.toHaveBeenCalled()
      expect(dispatch).not.toHaveBeenCalled()
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
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[]}
          accountAddress={accountAddress}
          showMetadataForm={showMetadataForm}
        />
      )

      getByTestId('InsufficientBalanceLock')
    })

    it('renders a disabled lock when there is a purchase for a different lock', () => {
      expect.assertions(0)

      state.purchasingLockAddress = '0xapurchase'

      const { getByTestId } = rtl.render(
        <Lock
          lock={lock}
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[]}
          accountAddress={accountAddress}
          showMetadataForm={showMetadataForm}
        />
      )

      getByTestId('DisabledLock')
    })

    it('renders a disabled lock when there is an active key for a different lock', () => {
      expect.assertions(0)

      const { getByTestId } = rtl.render(
        <Lock
          lock={lock}
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[activeKeyForAnotherLock]}
          accountAddress={accountAddress}
          showMetadataForm={showMetadataForm}
        />
      )

      getByTestId('DisabledLock')
    })

    it('renders a processing lock when there is a purchase without transaction hash for this lock', () => {
      expect.assertions(0)

      state.purchasingLockAddress = '0xlockaddress'

      const { getByTestId } = rtl.render(
        <Lock
          lock={lock}
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[]}
          accountAddress={accountAddress}
          showMetadataForm={showMetadataForm}
        />
      )

      getByTestId('ProcessingLock')
    })

    it('renders a confirmed lock when there is a purchase with transaction hash for this lock', () => {
      expect.assertions(0)

      state.purchasingLockAddress = '0xlockaddress'
      state.transactionHash = '0xhash'

      jest.spyOn(usePurchaseKey, 'usePurchaseKey').mockImplementation(_ => ({
        purchaseKey,
        error: null,
      }))

      const { getByTestId } = rtl.render(
        <Lock
          lock={lock}
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[]}
          accountAddress={accountAddress}
          showMetadataForm={showMetadataForm}
        />
      )

      getByTestId('ConfirmedLock')
    })

    it('renders a confirmed lock when there is an active key for this lock', () => {
      expect.assertions(0)

      const { getByTestId } = rtl.render(
        <Lock
          lock={lock}
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={[activeKeyForThisLock]}
          accountAddress={accountAddress}
          showMetadataForm={showMetadataForm}
        />
      )

      getByTestId('ConfirmedLock')
    })
  })
})
