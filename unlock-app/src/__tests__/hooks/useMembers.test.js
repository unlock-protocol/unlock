import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useQuery } from '@apollo/react-hooks'
import keyHolderQuery from '../../queries/keyholdersByLock'
import { WalletServiceContext } from '../../utils/withWalletService'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { StorageServiceContext } from '../../utils/withStorageService'
import { MemberFilters } from '../../unlockTypes'

import useMembers, { buildMembersWithMetadata } from '../../hooks/useMembers'
import generateKeyTypedData from '../../structured_data/keyMetadataTypedData'
import {
  AuthenticationContext,
  defaultValues,
} from '../../contexts/AuthenticationContext'
import { ConfigContext } from '../../utils/withConfig'

jest.mock('../../structured_data/keyMetadataTypedData')
jest.mock('@apollo/react-hooks')

const signature = 'signature'
const viewer = '0xlockOwner'
const lock = {
  address: '0xlockAddress',
  owner: '0xlockOwner',
  name: 'my lock',
  keys: [
    {
      keyId: '1',
      expiration: '123456',
      owner: {
        address: '0x126',
      },
    },
    {
      keyId: '2',
      expiration: '123458',
      owner: {
        address: '0x252',
      },
    },
  ],
}
const storedMetata = [
  {
    userAddress: lock.keys[0].owner.address,
    data: {
      userMetadata: {
        protected: {
          email: 'julien@unlock-protocol.com',
        },
      },
    },
  },
  {
    userAddress: lock.keys[1].owner.address,
    data: {
      userMetadata: {
        protected: {
          email: 'chris@unlock-protocol.com',
        },
      },
    },
  },
]
const walletService = {
  signMessage: jest.fn((user, data, callback) => {
    return Promise.resolve(signature)
  }),
}

const web3Service = {
  isLockManager: jest.fn(() => true),
}
const storageService = {
  getBulkMetadataFor: jest.fn(() => Promise.resolve(storedMetata)),
}
const typedData = {}

const wrapper = ({ children }) => (
  <AuthenticationContext.Provider
    value={{
      ...defaultValues,
      network: 1,
    }}
  >
    <ConfigContext.Provider
      value={{
        networks: {
          1: {
            provider: 'http://provider',
          },
        },
      }}
    >
      <StorageServiceContext.Provider value={storageService}>
        <WalletServiceContext.Provider value={walletService}>
          <Web3ServiceContext.Provider value={web3Service}>
            {children}
          </Web3ServiceContext.Provider>
        </WalletServiceContext.Provider>
      </StorageServiceContext.Provider>
    </ConfigContext.Provider>
  </AuthenticationContext.Provider>
)

generateKeyTypedData.mockImplementation(() => typedData)
describe('useMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === Web3ServiceContext) {
        return web3Service
      }

      if (context === WalletServiceContext) {
        return walletService
      }

      if (context === StorageServiceContext) {
        return storageService
      }
    })
  })

  describe('buildMembersWithMetadata', () => {
    it('should call setMembers with each key if no metadata has been provided', () => {
      expect.assertions(1)
      const members = buildMembersWithMetadata(lock, [])
      expect(members).toEqual({
        '0xlockAddress-0x126': {
          expiration: 'Expired',
          keyholderAddress: '0x126',
          lockName: 'my lock',
          token: '1',
        },
        '0xlockAddress-0x252': {
          expiration: 'Expired',
          keyholderAddress: '0x252',
          lockName: 'my lock',
          token: '2',
        },
      })
    })

    it('should return an array of members with the corresponding metadata', () => {
      expect.assertions(1)

      const members = buildMembersWithMetadata(lock, storedMetata)
      expect(members).toEqual({
        '0xlockAddress-0x126': {
          email: 'julien@unlock-protocol.com',
          expiration: 'Expired',
          keyholderAddress: '0x126',
          lockName: 'my lock',
          token: '1',
        },
        '0xlockAddress-0x252': {
          email: 'chris@unlock-protocol.com',
          expiration: 'Expired',
          keyholderAddress: '0x252',
          lockName: 'my lock',
          token: '2',
        },
      })
    })
  })
})
