import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { EventEmitter } from 'events'
import { Web3ServiceContext } from '../../utils/withWeb3Service'

import { useKeyOwnershipStatus } from '../../hooks/useKeyOwnershipStatus'

class MockWeb3Service extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWeb3Service: any

const lockAddresses = ['0xlock1', '0xlock2']
const accountAddress = '0xmyaccount'

describe('usePaywallLocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === Web3ServiceContext) {
        return mockWeb3Service
      }
    })

    mockWeb3Service = new MockWeb3Service()
    mockWeb3Service.getKeyByLockForOwner = jest.fn(() => {
      return Promise.resolve(1337)
    })
  })

  it('should default to undefined and loading, then become an array with keys and stop loading', async () => {
    expect.assertions(4)
    const { result, wait } = renderHook(() =>
      useKeyOwnershipStatus(lockAddresses, accountAddress)
    )

    expect(result.current.keys).toEqual([])
    expect(result.current.loading).toBeTruthy()

    await wait(() => {
      return !result.current.loading
    })
    expect(result.current.keys).toHaveLength(2)
    expect(result.current.loading).toBeFalsy()
  })
})
