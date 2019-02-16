import * as rtl from 'react-testing-library'
import React from 'react'

import useLock from '../../hooks/useLock'
import LockContract from '../../artifacts/contracts/PublicLock.json'

import { makeGetLockAttributes } from '../../hooks/asyncActions/locks'
import { ReadOnlyContext } from '../../hooks/components/Web3'

// we are going to mock out everything possible
// in order to deal with asynchrony and hooks
// React testing has not yet caught up with async functions in hooks
// and this is the cleanest way to easily test them
jest.mock('../../hooks/asyncActions/locks.js')

describe('useLock hook', () => {
  let web3
  let getLockAttributes
  const lockAddress = 'address'
  const contract = { contract: 'contract' }

  // wrapper to use with rtl's testHook
  // allows us to pass in the mock wallet
  // the InnerWrapper is pulled from the test helpers file
  // and includes passing in mock config and testing for errors
  // thrown in hooks
  function wrapper(props) {
    return <ReadOnlyContext.Provider value={web3} {...props} />
  }

  beforeEach(() => {
    getLockAttributes = jest.fn()
    makeGetLockAttributes.mockImplementation(() => getLockAttributes)
    web3 = {
      eth: {
        Contract: jest.fn(() => contract),
      },
    }
  })
  it('calls makeGetLockAttributes', () => {
    rtl.testHook(
      () => {
        useLock(lockAddress)
      },
      { wrapper }
    )

    expect(makeGetLockAttributes).toHaveBeenCalledWith({
      web3,
      lockAddress,
      setLock: expect.any(Function),
    })
  })
  it('calls getLockAttributes', () => {
    rtl.testHook(
      () => {
        useLock(lockAddress)
      },
      { wrapper }
    )

    expect(getLockAttributes).toHaveBeenCalledWith(contract)
  })
  it('calls web3.eth.Contract with the LockContract abi', () => {
    rtl.testHook(
      () => {
        useLock(lockAddress)
      },
      { wrapper }
    )

    expect(web3.eth.Contract).toHaveBeenCalledWith(LockContract.abi, 'address')
  })
  it('returns the lock', () => {
    const {
      result: { current: lock },
    } = rtl.testHook(() => useLock(lockAddress), { wrapper })

    expect(lock).toEqual({ address: lockAddress })
  })
})
