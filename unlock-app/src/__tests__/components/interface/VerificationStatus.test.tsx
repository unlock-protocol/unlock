import React from 'react'
import * as rtl from '@testing-library/react'
import * as apolloHooks from '@apollo/react-hooks'
import { Provider } from 'react-redux'
import { VerificationStatus } from '../../../components/interface/VerificationStatus'
import { OwnedKey } from '../../../components/interface/keychain/KeychainTypes'
import createUnlockStore from '../../../createUnlockStore'
import signatureUtils from '../../../utils/signatures'
import { WalletServiceContext } from '../../../utils/withWalletService'
import { ConfigContext } from '../../../utils/withConfig'

jest.mock('../../../utils/signatures', () => {
  return {
    isSignatureValidForAddress: jest.fn(() => {
      return false
    }),
  }
})

jest.mock('../../../hooks/useIsLockManager', () => {
  return jest.fn().mockImplementation(() => ({ isLockManager: true }))
})

const accountAddress = '0xdeadbeef'
const account = {
  address: accountAddress,
  balance: '0',
}
const store = createUnlockStore({
  account,
})

const ownedKey: OwnedKey = {
  lock: {
    address: '0x123abc',
    name: 'Lock Around the Clock',
    expirationDuration: '123456',
    tokenAddress: 'a token address',
    price: '5',
    owner: '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
  },
  tokenURI: '',
  expiration: '12345678',
  id: 'an id',
  keyId: 'a key id',
}

describe('VerificationStatus', () => {
  beforeEach(() => {})

  it('should show an error if any required data is missing', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(<VerificationStatus account={account} />)

    getByText('No Signature Data Found')
  })

  it('should show a loader when the key is loading', () => {
    expect.assertions(0)

    const apolloSpy = jest.spyOn(apolloHooks, 'useQuery')
    apolloSpy.mockReturnValue({
      loading: true,
      error: undefined,
      data: {},
    } as any)

    const { getByText } = rtl.render(
      <VerificationStatus
        account={account}
        data={{
          accountAddress,
          lockAddress: '0x123abc',
          timestamp: 1234567,
        }}
        sig="this is a signature string, essentially"
        hexData="this is some hex data"
      />
    )

    getByText('loading')
  })

  it('should shows a message to indicate that the key is not valid if the signature does not match', () => {
    expect.assertions(0)

    const apolloSpy = jest.spyOn(apolloHooks, 'useQuery')
    apolloSpy.mockReturnValue({
      loading: false,
      error: undefined,
      data: {},
    } as any)

    signatureUtils.isSignatureValidForAddress = jest.fn(() => false)

    const { getByText } = rtl.render(
      <VerificationStatus
        account={account}
        data={{
          accountAddress,
          lockAddress: '0x123abc',
          timestamp: 1234567,
        }}
        sig="this is a signature string, essentially"
        hexData="this is some hex data"
      />
    )

    getByText('Key Invalid')
  })

  it('should shows a message to indicate that the key is not valid if there is no matching key', () => {
    expect.assertions(0)

    const apolloSpy = jest.spyOn(apolloHooks, 'useQuery')
    apolloSpy.mockReturnValue({
      loading: false,
      error: undefined,
      data: {},
    } as any)

    signatureUtils.isSignatureValidForAddress = jest.fn(() => true)

    const { getByText } = rtl.render(
      <VerificationStatus
        account={account}
        data={{
          accountAddress,
          lockAddress: '0x123abc',
          timestamp: 1234567,
        }}
        sig="this is a signature string, essentially"
        hexData="this is some hex data"
      />
    )

    getByText('Key Invalid')
  })

  it('should render a message to indicate that the key is valid when applicable', () => {
    expect.assertions(0)

    const WalletServiceProvider = WalletServiceContext.Provider
    const ConfigProvider = ConfigContext.Provider
    const config = {
      services: {
        storage: {
          host: 'host',
        },
      },
    }
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

    signatureUtils.isSignatureValidForAddress = jest.fn(() => {
      return true
    })

    const walletService = {
      getKeyMetadata: jest.fn((_, callback) => {
        callback(null, {
          userMetadata: {},
        })
      }),
    }
    const { getByText } = rtl.render(
      <WalletServiceProvider value={walletService}>
        <ConfigProvider value={config}>
          <Provider store={store}>
            <VerificationStatus
              account={account}
              data={{
                accountAddress,
                lockAddress: '0x123abc',
                timestamp: 1234567,
              }}
              sig="this is a signature string, essentially"
              hexData="this is some hex data"
            />
          </Provider>
        </ConfigProvider>
      </WalletServiceProvider>
    )

    getByText('Valid Key')
    getByText('Lock Around the Clock')
  })

  it('should render a message to indicate that the key is valid when applicable and no account is set (non web3 browser)', () => {
    expect.assertions(0)

    const WalletServiceProvider = WalletServiceContext.Provider
    const ConfigProvider = ConfigContext.Provider
    const config = {
      services: {
        storage: {
          host: 'host',
        },
      },
    }
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

    signatureUtils.isSignatureValidForAddress = jest.fn(() => {
      return true
    })

    const walletService = {
      getKeyMetadata: jest.fn((_, callback) => {
        callback(null, {
          userMetadata: {},
        })
      }),
    }
    const { getByText } = rtl.render(
      <WalletServiceProvider value={walletService}>
        <ConfigProvider value={config}>
          <Provider store={store}>
            <VerificationStatus
              account={undefined}
              data={{
                accountAddress,
                lockAddress: '0x123abc',
                timestamp: 1234567,
              }}
              sig="this is a signature string, essentially"
              hexData="this is some hex data"
            />
          </Provider>
        </ConfigProvider>
      </WalletServiceProvider>
    )

    getByText('Valid Key')
  })
})
