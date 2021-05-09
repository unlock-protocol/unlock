import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { EventEmitter } from 'events'
import { Web3ServiceContext } from '../../utils/withWeb3Service'

import { useIsLockManager } from '../../hooks/useIsLockManager'

class MockWeb3Service extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWeb3Service: any

describe('useIsLockManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === Web3ServiceContext) {
        return mockWeb3Service
      }
    })

    mockWeb3Service = new MockWeb3Service()
    mockWeb3Service.isLockManager = jest.fn(() => true)
  })

  it('should default to false, then populate true after call resolves', async () => {
    expect.assertions(4)
    const { result, waitFor } = renderHook(() =>
      useIsLockManager('0xlock', 1, '0xuser')
    )

    expect(result.current.isLockManager).toEqual(false)
    expect(result.current.loading).toEqual(true)

    await waitFor(() => {
      return !!result.current.isLockManager
    })
    expect(result.current.isLockManager).toEqual(true)
    expect(result.current.loading).toEqual(false)
  })
})
