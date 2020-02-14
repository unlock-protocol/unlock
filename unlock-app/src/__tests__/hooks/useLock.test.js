import React from 'react'
import { EventEmitter } from 'events'

import { renderHook } from '@testing-library/react-hooks'
import useLock from '../../hooks/useLock'
import configure from '../../config'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { ConfigContext } from '../../utils/withConfig'

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

describe('useLock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(React, 'useContext').mockImplementation(context => {
      if (context === Web3ServiceContext) {
        return mockWeb3Service
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
})
