import { renderHook, act } from '@testing-library/react-hooks'
import React from 'react'
import { EventEmitter } from 'events'
import { WalletServiceContext } from '../../utils/withWalletService'

import { usePurchaseKey } from '../../hooks/usePurchaseKey'

class MockWalletService extends EventEmitter {
  purchaseKey: jest.Mock<any, any>

  constructor() {
    super()
    this.purchaseKey = jest.fn().mockResolvedValue(true)
  }
}

let mockWalletService: MockWalletService

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

describe('usePaywallLocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation(context => {
      if (context === WalletServiceContext) {
        return mockWalletService
      }
    })

    mockWalletService = new MockWalletService()
  })

  it('should return an object containing a function that will purchase a key', async () => {
    expect.assertions(1)

    const { result } = renderHook(() => usePurchaseKey(lock))

    await act(async () => {
      result.current.purchaseKey()
    })

    expect(mockWalletService.purchaseKey).toHaveBeenCalledWith({
      erc20Address: lock.currencyContractAddress,
      keyPrice: lock.keyPrice,
      lockAddress: lock.address,
      owner: lock.owner,
    })
  })

  it('should indicate whether the transaction has initiated or not', async () => {
    expect.assertions(2)

    const { result } = renderHook(() => usePurchaseKey(lock))

    expect(result.current.initiatedPurchase).toBeFalsy()

    await act(async () => {
      result.current.purchaseKey()
    })

    expect(result.current.initiatedPurchase).toBeTruthy()
  })
})
