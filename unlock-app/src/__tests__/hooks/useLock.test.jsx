import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import useLock, { updateKeyPriceOnLock } from '../../hooks/useLock'
import configure from '../../config'
import LocksContext from '../../contexts/LocksContext'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { vi } from 'vitest'
const config = configure()
const networkId = 31337
const mockWeb3Service = {
  getTransaction: vi.fn(),
}
const mockWalletService = {
  networkId,
}
const propsLock = {
  address: '0xLock',
  name: 'My Lock',
}

vi.useFakeTimers()

describe('useLock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === LocksContext) {
        return { locks: {}, addLock: () => {} }
      }
      if (context === AuthenticationContext) {
        return { network: networkId }
      }
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

  describe('updateKeyPriceOnLock', () => {
    const lock = {
      address: propsLock.address,
    }
    const newKeyPrice = '123'
    const setLock = vi.fn(() => {})
    const callback = vi.fn(() => {})
    const hash = '0xtransaction'

    beforeEach(() => {
      mockWalletService.updateKeyPrice = vi.fn()
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
        {},
        expect.any(Function)
      )
    })
    it('should process the transaction to start polling it', async () => {
      expect.assertions(1)
      mockWalletService.updateKeyPrice = vi.fn(
        (params, transactionParams, callback) => {
          return callback(null, hash)
        }
      )
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
        networkId
      )
    })
  })
})
