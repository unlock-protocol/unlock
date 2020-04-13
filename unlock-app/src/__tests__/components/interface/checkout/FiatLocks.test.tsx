import React from 'react'
import * as rtl from '@testing-library/react'
import { FiatLocks } from '../../../../components/interface/checkout/FiatLocks'
import doNothing from '../../../../utils/doNothing'

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
let useCardsMock: any
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

jest.mock('../../../../hooks/useCards', () => {
  return {
    useCards: jest.fn(() => useCardsMock),
  }
})

describe('FiatLocks', () => {
  describe('component', () => {
    it('shows loading locks while loading', () => {
      expect.assertions(0)

      usePaywallLocksMock = { loading: true }
      useCardsMock = { loading: false, cards: [] }

      const { getByTestId } = rtl.render(
        <FiatLocks
          lockAddresses={['0xlock']}
          accountAddress={accountAddress}
          emitTransactionInfo={emitTransactionInfo}
          metadataRequired={false}
          showMetadataForm={doNothing}
        />
      )

      getByTestId('LoadingLock')
    })

    it('shows loading locks while cards are loading', () => {
      expect.assertions(0)

      usePaywallLocksMock = { loading: false }
      useCardsMock = { loading: true, cards: [] }

      const { getByTestId } = rtl.render(
        <FiatLocks
          lockAddresses={['0xlock']}
          accountAddress={accountAddress}
          emitTransactionInfo={emitTransactionInfo}
          metadataRequired={false}
          showMetadataForm={doNothing}
        />
      )

      getByTestId('LoadingLock')
    })

    it('shows live locks when usePaywallLocks useCards resolves', () => {
      expect.assertions(0)

      usePaywallLocksMock = { loading: false, locks: [lock] }
      useCardsMock = { loading: false, cards: [] }

      const { getByTestId } = rtl.render(
        <FiatLocks
          lockAddresses={['0xlock']}
          accountAddress={accountAddress}
          emitTransactionInfo={emitTransactionInfo}
          metadataRequired={false}
          showMetadataForm={doNothing}
        />
      )

      getByTestId('DisabledLock')
    })
  })
})
