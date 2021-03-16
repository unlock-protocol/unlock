import React from 'react'
import { EventEmitter } from 'events'
import { renderHook } from '@testing-library/react-hooks'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import { useSetUserMetadata } from '../../hooks/useSetUserMetadata'
import { UserMetadata } from '../../unlockTypes'

class MockWalletService extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWalletService: any
let callback: jest.Mock<any, any>

const locksmithHost = 'https://locksmith'
const lockAddress = '0xlock'
const userAddress = '0xuser'
const metadata: UserMetadata = {}

describe.skip('useSetUserMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === ConfigContext) {
        return {
          services: {
            storage: {
              host: locksmithHost,
            },
          },
        }
      }
    })

    mockWalletService = new MockWalletService()
    mockWalletService.setUserMetadata = jest.fn(
      (_: any, callback: () => void) => {
        callback()
      }
    )

    callback = jest.fn()
  })

  it('should call WalletService.setUserMetadata with the correct values', () => {
    expect.assertions(1)

    const { result } = renderHook(() => useSetUserMetadata())

    result.current.setUserMetadata(lockAddress, 1, metadata, callback)

    expect(mockWalletService.setUserMetadata).toHaveBeenCalledWith(
      {
        lockAddress,
        userAddress,
        metadata,
        locksmithHost,
      },
      callback
    )
  })

  it('should callback once metadata is set', () => {
    expect.assertions(2)

    const { result } = renderHook(() => useSetUserMetadata())

    expect(callback).not.toHaveBeenCalled()

    result.current.setUserMetadata(lockAddress, 1, metadata, callback)

    expect(callback).toHaveBeenCalled()
  })

  it('should callback even when there are error', () => {
    expect.assertions(2)

    const { result } = renderHook(() => useSetUserMetadata())

    expect(callback).not.toHaveBeenCalled()

    mockWalletService.setUserMetadata = jest.fn(() => {
      throw new Error()
    })
    result.current.setUserMetadata(lockAddress, 1, metadata, callback)

    expect(callback).toHaveBeenCalled()
  })
})
