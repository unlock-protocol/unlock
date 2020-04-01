import { renderHook, act } from '@testing-library/react-hooks'
import React from 'react'
import * as redux from 'react-redux'
import { EventEmitter } from 'events'
import { StorageServiceContext } from '../../utils/withStorageService'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { TransactionType, TransactionStatus } from '../../unlockTypes'

import useLocks from '../../hooks/useLocks'
import { UNLIMITED_KEYS_COUNT } from '../../constants'

import configure from '../../config'

const config = configure()
class MockWeb3Service extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWeb3Service

const mockWalletService = {}
const mockStorageService = {}
const mockGraphService = {}

jest.mock('../../services/graphService', () => {
  return function() {
    return mockGraphService
  }
})

const ownerAddress = '0xlockOwner'

let graphLocks = []
let pastTransactions = {}
const web3ServiceLock = {
  name: 'My Lock',
}

const networkName = 1984

describe('useLocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation(context => {
      if (context === Web3ServiceContext) {
        return mockWeb3Service
      }
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === StorageServiceContext) {
        return mockStorageService
      }
    })
    jest.spyOn(redux, 'useSelector').mockImplementation(() => ({
      name: networkName,
    }))

    mockWeb3Service = new MockWeb3Service()
    mockWeb3Service.getLock = jest.fn(address => {
      return Promise.resolve({
        address,
        ...web3ServiceLock,
      })
    })
    mockWeb3Service.generateLockAddress = jest.fn(() =>
      Promise.resolve('0xnewLockAddress')
    )

    mockWalletService.connect = jest.fn(() => {})
    mockWalletService.createLock = jest.fn(() => {})

    pastTransactions = {}
    mockStorageService.getRecentTransactionsHashesSentBy = jest.fn(() =>
      Promise.resolve({
        hashes: Object.keys(pastTransactions),
      })
    )
    mockStorageService.storeTransaction = jest.fn(() => {})

    mockGraphService.locksByOwner = jest.fn(() => Promise.resolve(graphLocks))
  })

  it('should default to loading and an empty list', async () => {
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

  it('retrieve the list of locks from the graph', async () => {
    expect.assertions(3)
    graphLocks = [
      {
        address: '0x123',
      },
      {
        address: '0x456',
      },
    ]

    const { result, wait } = renderHook(() => useLocks(ownerAddress))
    await wait(() => {
      return result.current.loading === false
    })
    const { loading, locks } = result.current
    expect(loading).toBe(false)
    expect(locks.length).toBe(2)
    expect(mockGraphService.locksByOwner).toHaveBeenCalledWith(ownerAddress)
  })

  describe('pending trasanctions', () => {
    beforeEach(() => {
      // Assume no graph locks for simplicit
      graphLocks = []

      mockWeb3Service.getTransaction = jest.fn(hash => {
        mockWeb3Service.emit('transaction.updated', hash, {
          lock: pastTransactions[hash].lock,
        })
      })
    })

    it('retrieve the list of recent transactions as they may include lock creations', async () => {
      expect.assertions(3)
      pastTransactions = {
        '0xt1': {
          hash: '0xt1',
          lock: '0x123',
          type: TransactionType.LOCK_CREATION,
          status: TransactionStatus.MINED,
        },
        '0xt2': {
          hash: '0xt2',
          type: TransactionType.LOCK_CREATION,
          status: TransactionStatus.MINED,
          lock: '0x456',
        },
      }
      mockStorageService.getRecentTransactionsHashesSentBy = jest.fn(() =>
        Promise.resolve({
          hashes: Object.values(pastTransactions),
        })
      )
      const { result, wait } = renderHook(() => useLocks(ownerAddress))
      await wait(() => {
        return result.current.locks.length === 2
      })
      const { loading, locks } = result.current
      expect(loading).toBe(false)
      expect(locks.length).toBe(2)

      expect(mockWeb3Service.getLock).toHaveBeenCalledTimes(
        Object.keys(pastTransactions).length
      )
    })

    it('should retrieve lock details only if the transaction is for a mined locked creation', async () => {
      expect.assertions(4)
      pastTransactions = {
        '0xt1': {
          hash: '0xt1',
          lock: '0x123',
          status: TransactionStatus.MINED,
        },
        '0xt2': {
          hash: '0xt2',
          type: TransactionType.LOCK_CREATION,
          status: TransactionStatus.PENDING,
          lock: '0x456',
        },
      }
      mockStorageService.getRecentTransactionsHashesSentBy = jest.fn(() =>
        Promise.resolve({
          hashes: Object.values(pastTransactions),
        })
      )
      const { result, wait } = renderHook(() => useLocks(ownerAddress))
      await wait(() => {
        return result.current.locks.length === 1
      })
      const { loading, locks } = result.current
      expect(loading).toBe(false)
      expect(locks.length).toBe(1)
      expect(locks[0]).toEqual({
        address: pastTransactions['0xt2'].lock,
        creationBlock: Number.MAX_SAFE_INTEGER.toString(),
        creationTransaction: pastTransactions['0xt2'],
      })

      expect(mockWeb3Service.getLock).not.toHaveBeenCalled()
    })
  })

  it('retrieve the locks details', async () => {
    expect.assertions(4)
    graphLocks = [
      {
        address: '0x123',
      },
      {
        address: '0x456',
      },
    ]

    const { result, wait } = renderHook(() => useLocks(ownerAddress))
    await wait(() => {
      return result.current.loading === false
    })
    const { loading, locks } = result.current
    expect(loading).toBe(false)
    expect(locks.length).toBe(2)
    expect(mockWeb3Service.getLock).toHaveBeenCalledWith(graphLocks[0].address)
    expect(mockWeb3Service.getLock).toHaveBeenCalledWith(graphLocks[1].address)
  })

  it('retrieve the locks details and set unlimitedKeys when applicable', async () => {
    expect.assertions(3)
    graphLocks = [
      {
        address: '0x123',
      },
    ]
    const web3ServiceLock = {
      name: 'My Lock',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
    }
    mockWeb3Service.getLock = jest.fn(() => {
      return Promise.resolve(web3ServiceLock)
    })
    const { result, wait } = renderHook(() => useLocks(ownerAddress))
    await wait(() => {
      return result.current.loading === false
    })
    const { loading, locks } = result.current
    expect(loading).toBe(false)
    expect(locks.length).toBe(1)
    expect(locks[0]).toEqual({
      ...web3ServiceLock,
      address: graphLocks[0].address,
      unlimitedKeys: true,
    })
  })

  it('merges locks when the same is yieded by the graph and past transactions', async () => {
    expect.assertions(2)
    graphLocks = [
      {
        address: '0x123',
      },
    ]
    pastTransactions = {
      '0xt1': {
        lock: '0x123',
      },
      '0xt3': {}, // This transaction does not create a lock
    }

    mockStorageService.getRecentTransactionsHashesSentBy = jest.fn(() =>
      Promise.resolve({
        hashes: Object.keys(pastTransactions),
      })
    )

    mockWeb3Service.getTransaction = jest.fn(hash => {
      mockWeb3Service.emit('transaction.updated', hash, {
        lock: pastTransactions[hash].lock,
      })
    })

    const { result, wait } = renderHook(() => useLocks(ownerAddress))
    await wait(() => {
      return result.current.loading === false
    })
    const { loading, locks } = result.current
    expect(loading).toBe(false)
    expect(locks.length).toBe(1)
  })

  describe('addLock', () => {
    let result
    const lock = {
      name: 'New lock',
      expirationDuration: 100,
      keyPrice: '1.0',
      maxNumberOfKeys: 1000,
      owner: ownerAddress,
    }
    const lockCreationTransasctionHash = '0xnewLockTransactionHash'

    beforeEach(async () => {
      const rendered = renderHook(() => useLocks(ownerAddress))
      await rendered.waitForNextUpdate()
      result = rendered.result
      // NOTE: There's a gotcha with updates. renderHook mutates the value of current when updates happen so you cannot destructure its values as the assignment will make a copy locking into the value at that time.
      // https://react-hooks-testing-library.com/usage/basic-hooks
      mockWalletService.createLock = jest.fn((lock, callback) => {
        return callback(null, lockCreationTransasctionHash)
      })
    })

    it('should generate the lock address', async done => {
      expect.assertions(1)
      await act(async () => {
        await result.current.addLock(lock, done)
      })
      expect(mockWeb3Service.generateLockAddress).toHaveBeenCalledWith(
        ownerAddress,
        lock
      )
    })

    it('should create the lock', async done => {
      expect.assertions(1)
      await act(async () => {
        await result.current.addLock(lock, done)
      })
      expect(mockWalletService.createLock).toHaveBeenCalledWith(
        {
          expirationDuration: lock.expirationDuration,
          keyPrice: lock.keyPrice,
          maxNumberOfKeys: lock.maxNumberOfKeys,
          owner: ownerAddress,
          name: lock.name,
          currencyContractAddress: lock.currencyContractAddress,
        },
        expect.any(Function)
      )
    })

    it('should store the new transaction', async done => {
      expect.assertions(1)
      await act(async () => {
        await result.current.addLock(lock, done)
      })

      expect(mockStorageService.storeTransaction).toHaveBeenCalledWith(
        lockCreationTransasctionHash,
        ownerAddress,
        config.unlockAddress,
        networkName
      )
    })

    it('should return the lock as part of the locks state', async done => {
      expect.assertions(1)
      const locksLength = result.current.locks.length
      await act(async () => {
        await result.current.addLock(lock, done)
      })
      expect(result.current.locks.length).toEqual(locksLength + 1)
    })

    it('should update the error when there was an error to create the lock', async () => {
      expect.assertions(1)
      const errorMessage = 'An error occured'
      await act(async () => {
        mockWalletService.createLock = jest.fn((lock, callback) => {
          callback(new Error(errorMessage))
          return Promise.resolve({})
        })
        await result.current.addLock(lock, () => {})
      })
      expect(result.current.error.message).toEqual('An error occured')
    })
  })
})
