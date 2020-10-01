import { renderHook, act } from '@testing-library/react-hooks'
import React from 'react'
import { EventEmitter } from 'events'
import { WalletServiceContext } from '../../utils/withWalletService'
import { StorageServiceContext } from '../../utils/withStorageService'
import { ConfigContext } from '../../utils/withConfig'
import { usePurchaseKey } from '../../hooks/usePurchaseKey'
import { StorageService } from '../../services/storageService'
import * as Store from '../../hooks/useCheckoutStore'

class MockWalletService extends EventEmitter {
  purchaseKey: jest.Mock<any, any>

  constructor() {
    super()
    this.purchaseKey = jest.fn().mockResolvedValue(true)
  }
}

let mockWalletService: MockWalletService

const accountAddress = '0xpurchaser'

const lock = {
  asOf: 3196,
  name: 'ETH Lock',
  maxNumberOfKeys: -1,
  owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
  expirationDuration: 300,
  keyPrice: '0.01',
  publicLockVersion: 6,
  balance: '0.03',
  outstandingKeys: 1,
  currencyContractAddress: null,
  unlimitedKeys: true,
  address: '0xEE9FE39966DF737eECa5920ABa975c283784Faf8',
}

let mockStorageService: StorageService
let mockConfig: any
let emitTransactionInfo: jest.Mock<any, any>
let dispatch: jest.Mock<any, any>

describe('usePurchaseKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockStorageService = new StorageService()
    mockConfig = {
      requiredNetworkId: 1337,
    }

    dispatch = jest.fn()
    emitTransactionInfo = jest.fn()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === StorageServiceContext) {
        return mockStorageService
      }
      if (context === ConfigContext) {
        return mockConfig
      }
    })

    jest.spyOn(Store, 'useCheckoutStore').mockImplementation(() => ({
      state: Store.defaultState,
      dispatch,
    }))

    mockWalletService = new MockWalletService()
  })

  it('should return an object containing a function that will purchase a key', async () => {
    expect.assertions(1)

    const { result } = renderHook(() => usePurchaseKey(emitTransactionInfo))

    await act(async () => {
      result.current.purchaseKey(lock, accountAddress)
    })

    expect(mockWalletService.purchaseKey).toHaveBeenCalledWith(
      {
        erc20Address: lock.currencyContractAddress,
        keyPrice: lock.keyPrice,
        lockAddress: lock.address,
        owner: accountAddress,
      },
      expect.any(Function)
    )
  })

  it('should provide an error value if an error occurs', async () => {
    expect.assertions(2)

    const { result } = renderHook(() => usePurchaseKey(emitTransactionInfo))

    mockWalletService.purchaseKey = jest.fn((_, callback: any) => {
      const error = new Error('failure')
      callback(error, null)
    })

    expect(result.current.error).toBeNull()

    await act(async () => {
      result.current.purchaseKey(lock, accountAddress)
    })

    expect(result.current.error?.message).toEqual('failure')
  })

  it('should dispatch a transaction hash when purchaseKey completes', async () => {
    expect.assertions(2)

    const { result } = renderHook(() => usePurchaseKey(emitTransactionInfo))
    const transaction = {
      data: '0xdata',
    }
    const hash = '0xhash'

    mockWalletService.purchaseKey = jest.fn((_, callback: any) => {
      callback(null, hash, transaction)
    })

    expect(dispatch).not.toHaveBeenCalled()

    await act(async () => {
      result.current.purchaseKey(lock, accountAddress)
    })

    expect(dispatch).toHaveBeenCalledWith({
      hash,
      kind: 'setTransactionHash',
    })
  })

  it('should emit transaction information when purchaseKey completes', async () => {
    expect.assertions(2)

    const { result } = renderHook(() => usePurchaseKey(emitTransactionInfo))
    const transaction = {
      data: '0xdata',
    }
    const hash = '0xhash'

    mockWalletService.purchaseKey = jest.fn((_, callback: any) => {
      callback(null, hash, transaction)
    })

    expect(emitTransactionInfo).not.toHaveBeenCalled()

    await act(async () => {
      result.current.purchaseKey(lock, accountAddress)
    })

    expect(emitTransactionInfo).toHaveBeenCalledWith({
      hash,
      lock: lock.address,
    })
  })

  it('should save the transaction', async () => {
    expect.assertions(1)

    const { result } = renderHook(() => usePurchaseKey(emitTransactionInfo))
    const transaction = {
      hash: '0xhash',
      data: '0xdata',
    }
    mockWalletService.purchaseKey = jest.fn((_, callback: any) => {
      callback(null, transaction.hash, transaction)
    })

    mockStorageService.storeTransaction = jest.fn(() => Promise.resolve())

    await act(async () => {
      result.current.purchaseKey(lock, accountAddress)
    })

    expect(mockStorageService.storeTransaction).toHaveBeenCalledWith(
      transaction.hash,
      accountAddress,
      lock.address,
      mockConfig.requiredNetworkId,
      accountAddress,
      transaction.data
    )
  })
})
