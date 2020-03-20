import React from 'react'
import * as rtl from '@testing-library/react'
import { UserAccountLocks } from '../../../../components/interface/checkout/UserAccountLocks'

const lock = {
  name: 'a test lock',
  address: '0xlock',
  keyPrice: '0.01',
  expirationDuration: 555555555,
  currencyContractAddress: null,
}

const accountAddress = '0xaccount'

const emitTransactionInfo = jest.fn()

let usePaywallLocksMock: any
const useFiatKeyPricesMock: any = {}

jest.mock('../../../../hooks/usePaywallLocks', () => {
  return {
    usePaywallLocks: jest.fn(() => usePaywallLocksMock),
  }
})

jest.mock('../../../../hooks/useKeyOwnershipStatus', () => {
  return {
    useKeyOwnershipStatus: () => ({ keys: [], loading: false }),
  }
})

jest.mock('../../../../hooks/useFiatKeyPrices', () => {
  return {
    useFiatKeyPrices: jest.fn(() => useFiatKeyPricesMock),
  }
})

describe('UserAccountLocks', () => {
  describe('component', () => {
    it('shows loading locks while loading', () => {
      expect.assertions(0)

      usePaywallLocksMock = { loading: true }

      const { getByTestId } = rtl.render(
        <UserAccountLocks
          lockAddresses={['0xlock']}
          accountAddress={accountAddress}
          emitTransactionInfo={emitTransactionInfo}
        />
      )

      getByTestId('LoadingLock')
    })

    it('shows live locks when usePaywallLocks resolves', () => {
      expect.assertions(0)

      usePaywallLocksMock = { loading: false, locks: [lock] }

      const { getByTestId } = rtl.render(
        <UserAccountLocks
          lockAddresses={['0xlock']}
          accountAddress={accountAddress}
          emitTransactionInfo={emitTransactionInfo}
        />
      )

      getByTestId('DisabledLock')
    })
  })
})
