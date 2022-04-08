import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { EventEmitter } from 'events'
import { StorageServiceContext } from '../../utils/withStorageService'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { GraphServiceContext } from '../../utils/withGraphService'
import { ConfigContext } from '../../utils/withConfig'
import { TransactionStatus } from '../../unlockTypes'

import useLocks, {
  getLockAtAddress,
  retrieveLocks,
  createLock,
} from '../../hooks/useLocks'
import { UNLIMITED_KEYS_COUNT } from '../../constants'

class MockWeb3Service extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWeb3Service

const mockWalletService = {
  networkId: 1337,
}
const mockStorageService = {}
const mockGraphService = {}
const mockConfig = {
  networks: {
    1337: {
      blockTime: 2,
    },
  },
}

const ownerAddress = '0xlockOwner'
const lockAddress = '0xlockAddress'

let graphLocks = []
let pastTransactions = {}
const web3ServiceLock = {
  name: 'My Lock',
}

const network = 1337

const transaction = {}

describe('useLocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === Web3ServiceContext) {
        return mockWeb3Service
      }
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === StorageServiceContext) {
        return mockStorageService
      }
      if (context === GraphServiceContext) {
        return mockGraphService
      }
      if (context === ConfigContext) {
        return mockConfig
      }
    })
    mockWeb3Service = new MockWeb3Service()
    mockWeb3Service.getLock = jest.fn((address) => {
      return Promise.resolve({
        address,
        ...web3ServiceLock,
      })
    })
    mockWeb3Service.getTransaction = jest.fn(() => {
      Promise.resolve(transaction)
    })

    mockWalletService.connect = jest.fn(() => {})
    mockWalletService.createLock = jest.fn(() => {})

    pastTransactions = {}
    mockStorageService.getRecentTransactionsHashesSentBy = jest.fn(() =>
      Promise.resolve({
        hashes: Object.keys(pastTransactions),
      })
    )
    mockStorageService.storeTransaction = jest.fn(() => {})

    mockGraphService.locksByManager = jest.fn(() => Promise.resolve(graphLocks))
  })

  it.skip('should default to loading and an empty list', async () => {
    expect.assertions(4)
    const { result, waitForNextUpdate } = renderHook(() =>
      useLocks(ownerAddress)
    )
    const { loading, locks } = result.current
    expect(loading).toBe(true)
    expect(locks.length).toBe(0)
    await waitForNextUpdate()
    const { loading: loadingAfter, locks: locksAfter } = result.current
    expect(loadingAfter).toBe(false)
    expect(locksAfter.length).toBe(0)
  })

  it.skip('retrieve the list of locks from the graph', async () => {
    expect.assertions(3)
    graphLocks = [
      {
        address: '0x123',
      },
      {
        address: '0x456',
      },
    ]

    const { result, waitFor } = renderHook(() => useLocks(ownerAddress))
    await waitFor(() => {
      return result.current.loading === false
    })
    const { loading, locks } = result.current
    expect(loading).toBe(false)
    expect(locks.length).toBe(2)
    expect(mockGraphService.locksByManager).toHaveBeenCalledWith(ownerAddress)
  })

  describe('getLockAtAddress', () => {
    it('should retrieve the lock using web3Service', async () => {
      expect.assertions(2)
      mockWeb3Service.getLock = jest.fn(() => Promise.resolve(web3ServiceLock))
      const lock = await getLockAtAddress(mockWeb3Service, lockAddress, 1337)
      expect(lock).toEqual(web3ServiceLock)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lockAddress, network)
    })

    it('should unlimited keys', async () => {
      expect.assertions(1)
      const web3ServiceLock = {
        maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      }
      mockWeb3Service.getLock = jest.fn(() => Promise.resolve(web3ServiceLock))
      const lock = await getLockAtAddress(mockWeb3Service, lockAddress, 1337)
      expect(lock.unlimitedKeys).toBe(true)
    })
  })

  describe('retrieveLocks', () => {
    it('should retrieve the locks from the graph', async () => {
      expect.assertions(1)
      const locks = []
      mockGraphService.getLock = jest.fn(() => Promise.resolve(locks))
      const addToLocks = jest.fn()
      const setLoading = jest.fn()
      await retrieveLocks(
        mockWeb3Service,
        mockGraphService,
        ownerAddress,
        addToLocks,
        setLoading,
        network
      )
      expect(setLoading).toHaveBeenCalledWith(false)
    })

    it('should retrieve each lock data from web3Service', async () => {
      expect.assertions(5)
      const locks = [
        {
          address: '0xlock1',
        },
        {
          address: '0xlock2',
        },
      ]

      mockGraphService.locksByManager = jest.fn(() => Promise.resolve(locks))
      const addToLocks = jest.fn()
      const setLoading = jest.fn()
      await retrieveLocks(
        mockWeb3Service,
        mockGraphService,
        ownerAddress,
        addToLocks,
        setLoading,
        network
      )
      expect(mockWeb3Service.getLock).toHaveBeenCalledTimes(2)
      expect(mockWeb3Service.getLock).toHaveBeenNthCalledWith(
        1,
        '0xlock1',
        network
      )
      expect(mockWeb3Service.getLock).toHaveBeenNthCalledWith(
        2,
        '0xlock2',
        network
      )
      expect(addToLocks).toHaveBeenCalledTimes(2)
      expect(setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe('createLock', () => {
    const owner = '0xowner'
    const lock = {
      name: 'my lock',
      address: lockAddress,
      expirationDuration: 60 * 60 * 5,
      keyPrice: '1',
      maxNumberOfKeys: 100,
    }
    let addToLocks
    let setError

    beforeEach(() => {
      addToLocks = jest.fn()
      setError = jest.fn()
      mockWalletService.createLock = jest.fn(() => {})
    })

    it('should call createLock on walletService', async () => {
      expect.assertions(1)
      mockWalletService.createLock = jest.fn(() => {})
      await createLock(
        mockWeb3Service,
        mockWalletService,
        mockStorageService,
        owner,
        lock,
        mockConfig,
        network,
        addToLocks,
        setError,
        () => {}
      )
      expect(mockWalletService.createLock).toHaveBeenCalledWith(
        {
          currencyContractAddress: undefined,
          expirationDuration: lock.expirationDuration,
          keyPrice: lock.keyPrice,
          maxNumberOfKeys: lock.maxNumberOfKeys,
          name: lock.name,
          owner,
        },
        expect.any(Function)
      )
    })

    it('should call addToLocks', async () => {
      expect.assertions(1)
      mockWalletService.createLock = jest.fn((lock, callback) => {
        callback(null, transaction.hash)
      })
      await createLock(
        mockWeb3Service,
        mockWalletService,
        mockStorageService,
        owner,
        lock,
        mockConfig,
        network,
        addToLocks,
        setError,
        () => {}
      )
      expect(addToLocks).toHaveBeenCalledWith({
        address: lockAddress,
        ...lock,
        creationBlock: '9007199254740991',
      })
    })
  })
})
