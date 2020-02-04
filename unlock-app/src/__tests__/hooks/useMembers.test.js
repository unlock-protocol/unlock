import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useDispatch } from 'react-redux'
import { useQuery } from '@apollo/react-hooks'
import keyHolderQuery from '../../queries/keyholdersByLock'
import { WalletServiceContext } from '../../utils/withWalletService'
import { StorageServiceContext } from '../../utils/withStorageService'

import useMembers, {
  getAllKeysMetadataForLock,
  buildMembersWithMetadata,
} from '../../hooks/useMembers'
import {
  waitForWallet,
  dismissWalletCheck,
} from '../../actions/fullScreenModals'
import generateKeyTypedData from '../../structured_data/keyMetadataTypedData'

jest.mock('../../structured_data/keyMetadataTypedData')
jest.mock('@apollo/react-hooks')
jest.mock('react-redux')

const signature = 'signature'
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
  signData: jest.fn((user, data, callback) => {
    return callback(null, signature)
  }),
}
const storageService = {
  getBulkMetadataFor: jest.fn(() => Promise.resolve(storedMetata)),
}
const dispatch = jest.fn(() => {})
const typedData = {}
generateKeyTypedData.mockImplementation(() => typedData)

const mockDispatch = jest.fn(() => {})
useDispatch.mockImplementation(() => mockDispatch)

describe('useMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllKeysMetadataForLock', () => {
    it('should dispatch message to ask the user to check their wallet', async () => {
      expect.assertions(1)
      await getAllKeysMetadataForLock(
        lock,
        walletService,
        storageService,
        dispatch
      )
      expect(dispatch).toHaveBeenCalledWith(waitForWallet())
    })

    it('should generate the typed key data', async () => {
      expect.assertions(1)
      await getAllKeysMetadataForLock(
        lock,
        walletService,
        storageService,
        dispatch
      )
      expect(generateKeyTypedData).toHaveBeenCalledWith({
        LockMetaData: {
          address: lock.address,
          owner: lock.owner,
          timestamp: expect.any(Number),
        },
      })
    })

    it('should ask the user to sign a request', async () => {
      expect.assertions(1)

      await getAllKeysMetadataForLock(
        lock,
        walletService,
        storageService,
        dispatch
      )
      expect(walletService.signData).toHaveBeenCalledWith(
        lock.owner,
        typedData,
        expect.any(Function)
      )
    })

    it('should retrieve the data from the storage service', async () => {
      expect.assertions(2)

      const metadataForLock = await getAllKeysMetadataForLock(
        lock,
        walletService,
        storageService,
        dispatch
      )
      expect(storageService.getBulkMetadataFor).toHaveBeenCalledWith(
        lock.address,
        signature,
        typedData
      )
      expect(metadataForLock).toEqual(storedMetata)
    })

    it('should dispatch message to dismiss the check your wallet message', async () => {
      expect.assertions(1)
      await getAllKeysMetadataForLock(
        lock,
        walletService,
        storageService,
        dispatch
      )
      expect(dispatch).toHaveBeenCalledWith(dismissWalletCheck())
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
        },
        '0xlockAddress-0x252': {
          expiration: 'Expired',
          keyholderAddress: '0x252',
          lockName: 'my lock',
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
        },
        '0xlockAddress-0x252': {
          email: 'chris@unlock-protocol.com',
          expiration: 'Expired',
          keyholderAddress: '0x252',
          lockName: 'my lock',
        },
      })
    })
  })

  describe('useMembers', () => {
    it('should use the keyHolderQuery to get list of key holders', () => {
      expect.assertions(1)
      useQuery.mockImplementation(() => ({
        loading: false,
        error: false,
        data: [],
      }))
      renderHook(() => useMembers([lock.address]))
      expect(useQuery).toHaveBeenCalledWith(keyHolderQuery(), {
        variables: { addresses: [lock.address] },
      })
    })

    it('should set loading to true if useQuery is loading', () => {
      expect.assertions(1)
      useQuery.mockImplementation(() => ({
        loading: true,
        error: false,
        data: [],
      }))
      const { result } = renderHook(() => useMembers([lock.address]))
      expect(result.current.loading).toBe(true)
    })

    it('should set error to true if useQuery yieded an error', () => {
      expect.assertions(1)
      useQuery.mockImplementation(() => ({
        loading: false,
        error: true,
        data: [],
      }))
      const { result } = renderHook(() => useMembers([lock.address]))
      expect(result.current.error).toBe(true)
    })

    describe('when the viewer is not a lock owner', () => {
      it('should render the list of members without metadata', async () => {
        expect.assertions(2)
        useQuery.mockImplementation(() => ({
          loading: false,
          error: false,
          data: {
            locks: [lock],
          },
        }))
        const { result, waitForNextUpdate } = renderHook(() =>
          useMembers([lock.address], 'not lock.owner')
        )
        const initialResult = result.current
        expect(initialResult).toEqual({
          loading: true,
          error: false,
          columns: ['lockName', 'keyholderAddress', 'expiration'],
          list: [],
        })
        await waitForNextUpdate()

        const loadedResult = result.current
        expect(loadedResult).toEqual({
          loading: false,
          error: false,
          columns: ['lockName', 'keyholderAddress', 'expiration'],
          list: [
            {
              expiration: 'Expired',
              keyholderAddress: '0x126',
              lockName: 'my lock',
            },
            {
              expiration: 'Expired',
              keyholderAddress: '0x252',
              lockName: 'my lock',
            },
          ],
        })
      })
    })

    describe('when the viewer is the lock owner', () => {
      it('should yield the metadata with keys', async () => {
        expect.assertions(2)

        // https://react-hooks-testing-library.com/usage/advanced-hooks#context
        // eslint-disable-next-line react/prop-types
        const wrapper = ({ children }) => (
          <StorageServiceContext.Provider value={storageService}>
            <WalletServiceContext.Provider value={walletService}>
              {children}
            </WalletServiceContext.Provider>
          </StorageServiceContext.Provider>
        )

        useQuery.mockImplementation(() => ({
          loading: false,
          error: false,
          data: {
            locks: [lock],
          },
        }))
        const { result, waitForNextUpdate } = renderHook(
          () => useMembers([lock.address], lock.owner),
          { wrapper }
        )
        const initialResult = result.current
        expect(initialResult).toEqual({
          loading: true,
          error: false,
          columns: ['lockName', 'keyholderAddress', 'expiration'],
          list: [],
        })
        await waitForNextUpdate()
        const loadedResult = result.current
        expect(loadedResult).toEqual({
          loading: false,
          error: false,
          columns: ['lockName', 'keyholderAddress', 'expiration', 'email'],
          list: [
            {
              expiration: 'Expired',
              email: 'julien@unlock-protocol.com',
              keyholderAddress: '0x126',
              lockName: 'my lock',
            },
            {
              expiration: 'Expired',
              email: 'chris@unlock-protocol.com',
              keyholderAddress: '0x252',
              lockName: 'my lock',
            },
          ],
        })
      })
    })
  })
})
