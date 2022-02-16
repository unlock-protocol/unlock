import React from 'react'
import * as rtl from '@testing-library/react'
import * as apolloHooks from '@apollo/react-hooks'
import { VerificationStatus } from '../../../components/interface/VerificationStatus'
import { OwnedKey } from '../../../components/interface/keychain/KeychainTypes'
import signatureUtils from '../../../utils/signatures'
import { WalletServiceContext } from '../../../utils/withWalletService'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import { ConfigContext } from '../../../utils/withConfig'
import {
  AuthenticationContext,
  defaultValues,
} from '../../../contexts/AuthenticationContext'

jest.mock('../../../utils/signatures', () => {
  return {
    isSignatureValidForAddress: jest.fn(() => {
      return false
    }),
  }
})
const accountAddress = '0xdeadbeef'
const account = {
  address: accountAddress,
  balance: '0',
}

const lock = {
  address: '0x123abc',
  name: 'Lock Around the Clock',
  expirationDuration: '123456',
  tokenAddress: 'a token address',
  price: '5',
  owner: '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
}

const ownedKey: OwnedKey = {
  lock,
  tokenURI: '',
  expiration: '12345678',
  id: 'an id',
  keyId: 'a key id',
}

const renderWithContexts = (children: any) => {
  const account = '0x123'
  const network = 1337
  const Web3ServiceContextProvider = Web3ServiceContext.Provider
  const web3Service = {
    getKeyByLockForOwner: jest.fn(() => ownedKey),
    getLock: jest.fn(() => lock),
  }
  return rtl.render(
    <AuthenticationContext.Provider
      value={{ ...defaultValues, account, network }}
    >
      <Web3ServiceContextProvider value={web3Service}>
        {children}
      </Web3ServiceContextProvider>
    </AuthenticationContext.Provider>
  )
}

describe('VerificationStatus', () => {
  beforeEach(() => {})

  it('should show a loader when the key is loading', () => {
    expect.assertions(0)

    const apolloSpy = jest.spyOn(apolloHooks, 'useQuery')
    apolloSpy.mockReturnValue({
      loading: true,
      error: undefined,
      data: {},
    } as any)

    const { getByText } = renderWithContexts(
      <VerificationStatus
        data={{
          account: account.address,
          lockAddress: '0x123abc',
          timestamp: 1234567,
          network: 1984,
        }}
        sig="this is a signature string, essentially"
        hexData="this is some hex data"
      />
    )

    getByText('loading')
  })

  it.skip('should shows a message to indicate that the key is not valid if the signature does not match', () => {
    expect.assertions(0)

    const apolloSpy = jest.spyOn(apolloHooks, 'useQuery')
    apolloSpy.mockReturnValue({
      loading: false,
      error: undefined,
      data: {},
    } as any)

    signatureUtils.isSignatureValidForAddress = jest.fn(() => false)

    const { getByText } = renderWithContexts(
      <VerificationStatus
        data={{
          account: account.address,
          lockAddress: '0x123abc',
          timestamp: 1234567,
          network: 1984,
        }}
        sig="this is a signature string, essentially"
        hexData="this is some hex data"
      />
    )

    getByText('Key Invalid')
  })

  it.skip('should shows a message to indicate that the key is not valid if there is no matching key', () => {
    expect.assertions(0)

    const apolloSpy = jest.spyOn(apolloHooks, 'useQuery')
    apolloSpy.mockReturnValue({
      loading: false,
      error: undefined,
      data: {},
    } as any)

    signatureUtils.isSignatureValidForAddress = jest.fn(() => true)

    const { getByText } = renderWithContexts(
      <VerificationStatus
        data={{
          account: account.address,
          lockAddress: '0x123abc',
          timestamp: 1234567,
          network: 1984,
        }}
        sig="this is a signature string, essentially"
        hexData="this is some hex data"
      />
    )

    getByText('Key Invalid')
  })

  it.skip('should render a message to indicate that the key is valid when applicable', () => {
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
    const { getByText } = renderWithContexts(
      <WalletServiceProvider value={walletService}>
        <ConfigProvider value={config}>
          <VerificationStatus
            data={{
              account: account.address,
              lockAddress: '0x123abc',
              timestamp: 1234567,
              network: 1984,
            }}
            sig="this is a signature string, essentially"
            hexData="this is some hex data"
          />
        </ConfigProvider>
      </WalletServiceProvider>
    )

    getByText('Valid Key')
    getByText('Lock Around the Clock')
  })

  it.skip('should render a message to indicate that the key is valid when applicable and no account is set (non web3 browser)', () => {
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
    const { getByText } = renderWithContexts(
      <WalletServiceProvider value={walletService}>
        <ConfigProvider value={config}>
          <VerificationStatus
            data={{
              account: account.address,
              lockAddress: '0x123abc',
              timestamp: 1234567,
              network: 1984,
            }}
            sig="this is a signature string, essentially"
            hexData="this is some hex data"
          />
        </ConfigProvider>
      </WalletServiceProvider>
    )

    getByText('Valid Key')
  })
})
