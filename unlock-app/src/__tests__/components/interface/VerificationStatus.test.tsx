import React from 'react'
import * as rtl from '@testing-library/react'
import * as apolloHooks from '@apollo/react-hooks'
import sigUtil from 'eth-sig-util'
import { Provider } from 'react-redux'
import {
  VerificationStatus,
  Identity,
  OwnsKey,
} from '../../../components/interface/VerificationStatus'
import * as durations from '../../../utils/durations'
import { OwnedKey } from '../../../components/interface/keychain/KeychainTypes'

import createUnlockStore from '../../../createUnlockStore'

const accountAddress = '0xdeadbeef'

const store = createUnlockStore({
  account: {
    address: accountAddress,
  },
})

const ownedKey: OwnedKey = {
  lock: {
    address: '0x123abc',
    name: 'Lock Around the Clock',
    expirationDuration: '123456',
    tokenAddress: 'a token address',
    price: '5',
  },
  tokenURI: '',
  expiration: '12345678',
  id: 'an id',
  keyId: 'a key id',
}

describe('VerificationStatus', () => {
  beforeEach(() => {})

  describe('Main component', () => {
    it('should show an error if any required data is missing', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(<VerificationStatus />)

      getByText('No Signature Data Found')
    })

    it('should render full results if all data is present', () => {
      expect.assertions(0)

      const apolloSpy = jest.spyOn(apolloHooks, 'useQuery')
      apolloSpy.mockReturnValue({
        loading: undefined,
        error: undefined,
        data: {
          keyHolders: [
            {
              keys: [ownedKey],
            },
          ],
        },
      } as any)

      const sigUtilSpy = jest.spyOn(sigUtil, 'recoverPersonalSignature')
      sigUtilSpy.mockReturnValue(accountAddress)

      const { getByText } = rtl.render(
        <Provider store={store}>
          <VerificationStatus
            data={{
              accountAddress,
              lockAddress: '0x123abc',
              timestamp: 1234567,
            }}
            sig="this is a signature string, essentially"
            hexData="this is some hex data"
          />
        </Provider>
      )

      getByText('Identity is valid.')
      getByText('Lock Around the Clock')
    })
  })

  describe('Identity', () => {
    it('should indicate when an identity assertion is invalid', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(<Identity valid={false} />)

      getByText('Identity is INVALID.')
    })

    it('should indicate when an identity assertion is valid', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(<Identity valid />)

      getByText('Identity is valid.')
    })
  })

  describe('OwnsKey', () => {
    it('should indicate when it is loading', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <OwnsKey accountAddress={accountAddress} loading error={undefined} />
      )

      getByText('Checking if user has a valid key...')
    })

    it('should indicate when there is an error', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <OwnsKey
          accountAddress={accountAddress}
          loading={false}
          error={new Error('oh bother') as any}
        />
      )

      getByText('Error: oh bother')
    })

    it('should indicate when the user does not have a key', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <OwnsKey
          accountAddress={accountAddress}
          loading={false}
          error={undefined}
        />
      )

      getByText('This user does not have a key to the lock.')
    })

    it('should indicate when the key is expired', () => {
      expect.assertions(0)

      const spy = jest.spyOn(durations, 'expirationAsDate')
      spy.mockReturnValue('Expired')

      const { getByText } = rtl.render(
        <Provider store={store}>
          <OwnsKey
            accountAddress={accountAddress}
            loading={false}
            error={undefined}
            matchingKey={ownedKey}
          />
        </Provider>
      )

      getByText('The user 0xdeadbeef owns a key, which is expired.')
      spy.mockClear()
    })

    it('should indicate when the key is valid', () => {
      expect.assertions(0)

      const spy = jest.spyOn(durations, 'expirationAsDate')
      spy.mockReturnValue('November 14, 3021')

      const { getByText } = rtl.render(
        <Provider store={store}>
          <OwnsKey
            accountAddress={accountAddress}
            loading={false}
            error={undefined}
            matchingKey={ownedKey}
          />
        </Provider>
      )

      getByText(
        'The user 0xdeadbeef owns a key, which is valid until November 14, 3021.'
      )
      spy.mockClear()
    })
  })
})
