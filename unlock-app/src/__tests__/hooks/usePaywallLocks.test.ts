import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { EventEmitter } from 'events'
import { Web3ServiceContext } from '../../utils/withWeb3Service'

import usePaywallLocks from '../../hooks/usePaywallLocks'

class MockWeb3Service extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWeb3Service: any

const web3ServiceLock = {
  name: 'My Lock',
}

describe('usePaywallLocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation(context => {
      if (context === Web3ServiceContext) {
        return mockWeb3Service
      }
    })

    mockWeb3Service = new MockWeb3Service()
    mockWeb3Service.getLock = jest.fn(address => {
      return Promise.resolve({
        address,
        ...web3ServiceLock,
      })
    })
  })

  it('should default to an empty object and loading, then populate with locks and stop loading', async () => {
    expect.assertions(4)
    const lockAddresses = ['0xlock1', '0xlock2']
    const { result, wait } = renderHook(() =>
      usePaywallLocks(lockAddresses, jest.fn())
    )

    expect(result.current.locks).toEqual([])
    expect(result.current.loading).toBeTruthy()

    await wait(() => {
      return !result.current.loading
    })
    expect(result.current.locks).toHaveLength(2)
    expect(result.current.loading).toBeFalsy()
  })

  it('should query for ERC20 balance if needed', async () => {
    expect.assertions(1)
    mockWeb3Service.getLock = jest.fn(address => {
      return Promise.resolve({
        address,
        currencyContractAddress: '0xerc20',
        ...web3ServiceLock,
      })
    })
    const getTokenBalance = jest.fn()
    const lockAddresses = ['0xlock1']
    const { result, wait } = renderHook(() =>
      usePaywallLocks(lockAddresses, getTokenBalance)
    )

    await wait(() => {
      return !result.current.loading
    })

    expect(getTokenBalance).toHaveBeenCalledWith('0xerc20')
  })
})
