import React from 'react'
import { EventEmitter } from 'events'

import { renderHook, act } from '@testing-library/react-hooks'
import useLock from '../../hooks/useLock'
import configure from '../../config'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import { TransactionType } from '../../unlockTypes'

const config = configure()

class MockWeb3Service extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWeb3Service
const lock = {
  address: '0xLock',
  name: 'My Lock',
}
const mockWalletService = {}
describe('useLock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(React, 'useContext').mockImplementation(context => {
      if (context === Web3ServiceContext) {
        return mockWeb3Service
      }
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === ConfigContext) {
        return config
      }
    })
    mockWeb3Service = new MockWeb3Service()
  })

  it('should yield the lock as is if the lock does not have a creationTransaction', async () => {
    expect.assertions(1)
    const { result } = renderHook(() => useLock(lock))
    expect(result.current.lock).toEqual(lock)
  })

  describe('when there is a lockFromProps', () => {
    it('should get the transaction and update the lock with its data', async () => {
      expect.assertions(3)
      const update = {
        confirmations: 1,
      }
      mockWeb3Service.getTransaction = jest.fn(hash => {
        return mockWeb3Service.emit('transaction.updated', hash, update)
      })
      const creationTransaction = {
        hash: '0xcreationTransaction',
      }
      lock.creationTransaction = creationTransaction
      const { result } = renderHook(() => useLock(lock))
      expect(mockWeb3Service.getTransaction).toHaveBeenLastCalledWith(
        lock.creationTransaction.hash,
        creationTransaction
      )
      expect(result.current.lock.address).toEqual(lock.address)
      expect(result.current.lock.creationTransaction.confirmations).toEqual(
        update.confirmations
      )
    })

    it('should does not keep track of the transaction if there was enough confirmation', async () => {
      expect.assertions(1)
      const update = {
        confirmations: config.requiredConfirmations,
      }
      mockWeb3Service.getTransaction = jest.fn(hash => {
        return mockWeb3Service.emit('transaction.updated', hash, update)
      })
      const creationTransaction = {
        hash: '0xcreationTransaction',
      }
      lock.creationTransaction = creationTransaction
      const { result } = renderHook(() => useLock(lock))
      expect(result.current.lock.creationTransaction).toBe(undefined)
    })
  })

  describe('updateKeyPrice', () => {
    const priceUpdateTransactionHash = '0xTransactionHash'
    let hookResult

    beforeEach(() => {
      mockWalletService.updateKeyPrice = jest.fn((newKeyPrice, callback) => {
        return callback(null, priceUpdateTransactionHash)
      })
      hookResult = renderHook(() => useLock(lock)).result
    })

    it('should yield a function to update the key price', async () => {
      expect.assertions(2)
      const done = jest.fn()
      const newKeyPrice = '123'
      await act(async () => {
        await hookResult.current.updateKeyPrice(newKeyPrice, done)
      })
      expect(mockWalletService.updateKeyPrice).toHaveBeenCalledWith(
        {
          keyPrice: newKeyPrice,
          lockAddress: lock.address,
        },
        expect.any(Function)
      )
      expect(done).toHaveBeenCalledWith()
    })

    it('should set the priceUpdateTransaction on the lock object', async () => {
      expect.assertions(2)
      const done = jest.fn()
      const newKeyPrice = '123'
      await act(async () => {
        await hookResult.current.updateKeyPrice(newKeyPrice, done)
      })
      expect(hookResult.current.lock.keyPrice).toEqual(newKeyPrice)
      expect(hookResult.current.lock.priceUpdateTransaction).toMatchObject({
        confirmations: 0,
        hash: priceUpdateTransactionHash,
        lock: lock.address,
        type: TransactionType.UPDATE_KEY_PRICE,
      })
    })
  })
})
