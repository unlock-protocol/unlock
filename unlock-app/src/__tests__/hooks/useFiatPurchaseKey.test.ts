import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { StorageServiceContext } from '../../utils/withStorageService'
import { useFiatPurchaseKey } from '../../hooks/useFiatPurchaseKey'
import { StorageService } from '../../services/storageService'
import * as Store from '../../hooks/useCheckoutStore'
import * as Provider from '../../hooks/useProvider'
import { setTransactionHash } from '../../utils/checkoutActions'
import { WalletServiceContext } from '../../utils/withWalletService'

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
let emitTransactionInfo: jest.Mock<any, any>
let dispatch: jest.Mock<any, any>
let unformattedSignTypedData: jest.Mock<any, any>

describe('usePurchaseKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    unformattedSignTypedData = jest.fn()

    mockStorageService = new StorageService()

    dispatch = jest.fn()
    emitTransactionInfo = jest.fn()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === StorageServiceContext) {
        return mockStorageService
      }

      if (context === WalletServiceContext) {
        return { unformattedSignTypedData }
      }
    })

    jest.spyOn(Store, 'useCheckoutStore').mockImplementation(() => ({
      state: Store.defaultState,
      dispatch,
    }))

    jest.spyOn(Provider, 'useProvider').mockImplementation(
      () =>
        ({
          provider: {
            signKeyPurchaseRequestData: jest.fn(() => ({
              data: 'data',
              sig: 'sig',
            })),
          },
        } as any)
    )
  })

  it('should return an object with a loading value and a purchaseKey function', () => {
    expect.assertions(1)

    const { result } = renderHook(() => useFiatPurchaseKey(emitTransactionInfo))

    expect(result.current).toEqual(
      expect.objectContaining({
        loading: expect.any(Boolean),
        purchaseKey: expect.any(Function),
      })
    )
  })

  it('should call storageService to purchase a key and emit resulting transaction info', async () => {
    expect.assertions(3)

    mockStorageService.purchaseKey = jest.fn(() => Promise.resolve('txhash'))

    const { result } = renderHook(() => useFiatPurchaseKey(emitTransactionInfo))

    await result.current.purchaseKey(lock.address, accountAddress)

    expect(mockStorageService.purchaseKey).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(setTransactionHash('txhash'))
    expect(emitTransactionInfo).toHaveBeenCalledWith({
      hash: 'txhash',
      lock: lock.address,
    })
  })
})
