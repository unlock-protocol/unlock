import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import useLock, {
  processTransaction,
  updateKeyPriceOnLock,
} from '../../hooks/useLock'
import configure from '../../config'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import { TransactionType } from '../../unlockTypes'

const config = configure()
const mockWeb3Service = {}
const mockWalletService = {}
const propsLock = {
  address: '0xLock',
  name: 'My Lock',
}

jest.useFakeTimers()

describe('useLock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(React, 'useContext').mockImplementation((context) => {
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
  })

  it('should process the creation transaction', async () => {
    expect.assertions(1)
    const { result } = renderHook(() => useLock(propsLock))
    const { lock } = result.current
    expect(lock).toEqual(propsLock)
  })

  describe('processTransaction', () => {
    const setLock = jest.fn(() => {})
    const hash = '0xtransaction'
    const defaults = {}
    const transaction = {
      hash,
    }

    beforeEach(() => {
      mockWeb3Service.getTransaction = jest.fn(() =>
        Promise.resolve(transaction)
      )
    })

    it('should ignore transactions which are not lock creations or price updates', async () => {
      expect.assertions(2)
      await processTransaction(
        mockWeb3Service,
        config,
        propsLock,
        setLock,
        hash,
        defaults
      )
      expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
        hash,
        defaults
      )
      expect(setLock).not.toHaveBeenCalled()
    })

    it('should process lock creations', async () => {
      expect.assertions(1)
      transaction.type = 'LOCK_CREATION'
      transaction.confirmations = config.requiredConfirmations + 1
      await processTransaction(
        mockWeb3Service,
        config,
        propsLock,
        setLock,
        hash,
        defaults
      )
      expect(setLock).toHaveBeenCalledWith({
        address: '0xLock',
        creationTransaction: null,
        name: 'My Lock',
      })
    })

    it('should process price updates', async () => {
      expect.assertions(1)
      transaction.type = 'UPDATE_KEY_PRICE'
      transaction.confirmations = config.requiredConfirmations + 1
      await processTransaction(
        mockWeb3Service,
        config,
        propsLock,
        setLock,
        hash,
        defaults
      )
      expect(setLock).toHaveBeenCalledWith({
        address: '0xLock',
        name: 'My Lock',
      })
    })

    it('should poll if the transaction is not fully confirmed', async () => {
      expect.assertions(2)
      transaction.type = 'UPDATE_KEY_PRICE'
      transaction.confirmations = config.requiredConfirmations - 1
      await processTransaction(
        mockWeb3Service,
        config,
        propsLock,
        setLock,
        hash,
        defaults
      )
      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setLock).toHaveBeenCalledWith({
        address: '0xLock',
        name: 'My Lock',
      })
      jest.runAllTimers()
    })
  })

  describe('updateKeyPriceOnLock', () => {
    const lock = {
      address: propsLock.address,
    }
    const newKeyPrice = '123'
    const setLock = jest.fn(() => {})
    const callback = jest.fn(() => {})
    const hash = '0xtransaction'

    beforeEach(() => {
      mockWalletService.updateKeyPrice = jest.fn()
    })
    it('should use walletService to update the key price', async () => {
      expect.assertions(1)
      await updateKeyPriceOnLock(
        mockWeb3Service,
        mockWalletService,
        config,
        lock,
        newKeyPrice,
        setLock,
        callback
      )
      expect(mockWalletService.updateKeyPrice).toHaveBeenCalledWith(
        {
          keyPrice: '123',
          lockAddress: lock.address,
        },
        expect.any(Function)
      )
    })
    it('should process the transaction to start polling it', async () => {
      expect.assertions(1)
      mockWalletService.updateKeyPrice = jest.fn((params, callback) => {
        return callback(null, hash)
      })
      await updateKeyPriceOnLock(
        mockWeb3Service,
        mockWalletService,
        config,
        lock,
        newKeyPrice,
        setLock,
        callback
      )
      expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
        hash,
        undefined
      )
    })

    it.skip('should callback', async () => {
      expect.assertions(1)
      mockWalletService.updateKeyPrice = jest.fn((params, callback) => {
        return callback(null, hash)
      })
      await updateKeyPriceOnLock(
        mockWeb3Service,
        mockWalletService,
        config,
        lock,
        newKeyPrice,
        setLock,
        callback
      )
      expect(callback).toHaveBeenCalledWith()
    })
  })
})
