import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import useLock, { updateKeyPriceOnLock } from '../../hooks/useLock'
import configure from '../../config'
import LocksContext from '../../contexts/LocksContext'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'

const config = configure()
const networkId = 31337
const mockWeb3Service = {
  getTransaction: jest.fn(),
}
const mockWalletService = {
  networkId,
}
const propsLock = {
  address: '0xLock',
  name: 'My Lock',
}

jest.useFakeTimers()

describe('useLock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(React, 'useContext').mockImplementation((context) => {
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
        networkId
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
