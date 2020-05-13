import React from 'react'
import * as redux from 'react-redux'
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
  processLockCreationTransaction,
  retrieveLockCreationTransactions,
  createLock,
} from '../../hooks/useLocks'
import { UNLIMITED_KEYS_COUNT } from '../../constants'

class MockWeb3Service extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWeb3Service

const mockWalletService = {}
const mockStorageService = {}
const mockGraphService = {}
const mockConfig = {}

const ownerAddress = '0xlockOwner'
const lockAddress = '0xlockAddress'

let graphLocks = []
let pastTransactions = {}
const web3ServiceLock = {
  name: 'My Lock',
}

const networkName = 1984

const transaction = {}

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
      if (context === GraphServiceContext) {
        return mockGraphService
      }
      if (context === ConfigContext) {
        return mockConfig
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
    expect(mockGraphService.locksByManager).toHaveBeenCalledWith(ownerAddress)
  })

  describe('getLockAtAddress', () => {
    it('should retrieve the lock using web3Service', async () => {
      expect.assertions(2)
      mockWeb3Service.getLock = jest.fn(() => Promise.resolve(web3ServiceLock))
      const lock = await getLockAtAddress(mockWeb3Service, lockAddress)
      expect(lock).toEqual(web3ServiceLock)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lockAddress)
    })

    it('should unlimited keys', async () => {
      expect.assertions(1)
      const web3ServiceLock = {
        maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      }
      mockWeb3Service.getLock = jest.fn(() => Promise.resolve(web3ServiceLock))
      const lock = await getLockAtAddress(mockWeb3Service, lockAddress)
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
        setLoading
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
        setLoading
      )
      expect(mockWeb3Service.getLock).toHaveBeenCalledTimes(2)
      expect(mockWeb3Service.getLock).toHaveBeenNthCalledWith(1, '0xlock1')
      expect(mockWeb3Service.getLock).toHaveBeenNthCalledWith(2, '0xlock2')
      expect(addToLocks).toHaveBeenCalledTimes(2)
      expect(setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe('processLockCreationTransaction', () => {
    let addToLocks
    const transactionHash = '0xtransaction'
    const defaults = {}
    const transaction = {
      hash: transactionHash,
    }

    beforeEach(() => {
      addToLocks = jest.fn(() => {})
    })

    it('should getTransaction from web3Service', async () => {
      expect.assertions(1)
      mockWeb3Service.getTransaction = jest.fn(() =>
        Promise.resolve(transaction)
      )
      await processLockCreationTransaction(
        mockWeb3Service,
        mockConfig,
        addToLocks,
        transactionHash,
        defaults
      )
      expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
        transactionHash,
        defaults
      )
    })

    it('should not yield any lock when the transaction is not a lock creation', async () => {
      expect.assertions(2)
      mockWeb3Service.getTransaction = jest.fn(() =>
        Promise.resolve({
          ...transaction,
          type: 'not a lock creation',
        })
      )
      await processLockCreationTransaction(
        mockWeb3Service,
        mockConfig,
        addToLocks,
        transactionHash,
        defaults
      )
      expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
        transactionHash,
        defaults
      )
      expect(addToLocks).not.toHaveBeenCalled()
    })

    describe('when the transaction is a lock creation', () => {
      beforeEach(() => {
        transaction.type = 'LOCK_CREATION'
        transaction.lock = lockAddress
        transaction.blockNumber = 1337
      })

      it('should yield an existing lock if the transaction was mined', async () => {
        expect.assertions(2)
        transaction.status = TransactionStatus.MINED
        mockWeb3Service.getTransaction = jest.fn(() =>
          Promise.resolve(transaction)
        )

        await processLockCreationTransaction(
          mockWeb3Service,
          mockConfig,
          addToLocks,
          transactionHash,
          defaults
        )

        expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lockAddress)
        expect(addToLocks).toHaveBeenCalledWith({
          ...web3ServiceLock,
          address: lockAddress,
          creationBlock: transaction.blockNumber,
          creationTransaction: transaction,
          unlimitedKeys: false,
        })
      })

      it('should yield a "temporary" lock if the transaction was not mined', async () => {
        expect.assertions(2)
        transaction.status = TransactionStatus.PENDING
        mockWeb3Service.getTransaction = jest.fn(() =>
          Promise.resolve(transaction)
        )

        await processLockCreationTransaction(
          mockWeb3Service,
          mockConfig,
          addToLocks,
          transactionHash,
          defaults
        )

        expect(mockWeb3Service.getLock).not.toHaveBeenCalledWith()
        expect(addToLocks).toHaveBeenCalledWith({
          address: lockAddress,
          creationBlock: Number.MAX_SAFE_INTEGER.toString(),
          creationTransaction: transaction,
        })
      })
    })
  })

  describe('retrieveLockCreationTransactions', () => {
    it('should retrieve all the transactions for the owner', async () => {
      expect.assertions(2)
      const addToLocks = jest.fn()
      const owner = '0xowner'
      const transaction = {
        hash: '0x123',
        input: '0xinput',
      }
      mockStorageService.getRecentTransactionsHashesSentBy = jest.fn(() => {
        return {
          hashes: [transaction],
        }
      })

      mockWeb3Service.getTransaction = jest.fn(() =>
        Promise.resolve(transaction)
      )

      await retrieveLockCreationTransactions(
        mockWeb3Service,
        mockStorageService,
        mockConfig,
        addToLocks,
        owner
      )
      expect(
        mockStorageService.getRecentTransactionsHashesSentBy
      ).toHaveBeenCalledWith(owner)
      expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
        transaction.hash,
        transaction
      )
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
    const network = {
      name: networkName,
    }
    let addToLocks
    let setError

    beforeEach(() => {
      addToLocks = jest.fn()
      setError = jest.fn()
      mockWalletService.createLock = jest.fn(() => {})
      mockWeb3Service.generateLockAddress = jest.fn(() =>
        Promise.resolve(lockAddress)
      )
    })

    it('should call generateLockAddress on web3Service', async () => {
      expect.assertions(1)
      createLock(
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
      expect(mockWeb3Service.generateLockAddress).toHaveBeenCalledWith(owner, {
        address: lockAddress,
        balance: '0',
        outstandingKeys: 0,
        ...lock,
      })
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

    it('should store the transaction', async () => {
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
      expect(mockStorageService.storeTransaction).toHaveBeenCalledWith(
        transaction.hash,
        owner,
        mockConfig.unlockAddress,
        network.name
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
        creationTransaction: expect.objectContaining({
          confirmations: 0,
          hash: transaction.hash,
          lock: '0xlockAddress',
          type: 'Lock Creation',
        }),
      })
    })
  })
})
