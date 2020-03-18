import React from 'react'
import * as rtl from '@testing-library/react'
import {
  renderLock,
  UserAccountLocks,
} from '../../../../components/interface/checkout/UserAccountLocks'

const lock = {
  name: 'a test lock',
  address: '0xlock',
  keyPrice: '0.01',
  expirationDuration: 555555555,
  currencyContractAddress: null,
}

const prices = {
  [lock.address]: {
    usd: '12.33',
  },
}

let usePaywallLocksMock: any
const useFiatKeyPricesMock: any = {}

jest.mock('../../../../hooks/usePaywallLocks', () => {
  return {
    usePaywallLocks: jest.fn(() => usePaywallLocksMock),
  }
})

jest.mock('../../../../hooks/useFiatKeyPrices', () => {
  return {
    useFiatKeyPrices: jest.fn(() => useFiatKeyPricesMock),
  }
})

describe('UserAccountLocks', () => {
  describe('renderLock helper', () => {
    it('renders a disabled crypto lock for locks that do not have fiat prices', () => {
      expect.assertions(0)

      const { getByTestId, getByText } = rtl.render(renderLock(lock, {}))

      getByTestId('DisabledLock')
      getByText('0.01 ETH')
    })

    it('renders a disabled USD lock for locks that do have fiat prices', () => {
      expect.assertions(0)

      const { getByTestId, getByText } = rtl.render(renderLock(lock, prices))

      // After future work, this won't be a DisabledLock but a UserAccountLock
      getByTestId('DisabledLock')
      getByText('$12.33')
    })
  })

  describe('component', () => {
    it('shows loading locks while loading', () => {
      expect.assertions(0)

      usePaywallLocksMock = { loading: true }

      const { getByTestId } = rtl.render(
        <UserAccountLocks lockAddresses={['0xlock']} />
      )

      getByTestId('LoadingLock')
    })

    it('shows live locks when usePaywallLocks resolves', () => {
      expect.assertions(0)

      usePaywallLocksMock = { loading: false, locks: [lock] }

      const { getByTestId } = rtl.render(
        <UserAccountLocks lockAddresses={['0xlock']} />
      )

      getByTestId('DisabledLock')
    })
  })
})
