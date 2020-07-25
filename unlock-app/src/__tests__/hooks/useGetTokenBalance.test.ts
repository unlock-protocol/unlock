import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { EventEmitter } from 'events'
import { Web3ServiceContext } from '../../utils/withWeb3Service'

import { useGetTokenBalance } from '../../hooks/useGetTokenBalance'

class MockWeb3Service extends EventEmitter {
  constructor() {
    super()
  }
}

const balances = {
  '0x1': '5',
  '0x2': '0.05',
  eth: '12.506',
}
const accountAddress = '0xuser'

let mockWeb3Service: any

describe('useGetTokenBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === Web3ServiceContext) {
        return mockWeb3Service
      }
    })

    mockWeb3Service = new MockWeb3Service()
    mockWeb3Service.getTokenBalance = jest.fn(
      (contractAddress: '0x1' | '0x2', _: string) => {
        return Promise.resolve(balances[contractAddress])
      }
    )
    mockWeb3Service.refreshAccountBalance = jest.fn(
      (_: { address: string }) => {
        return Promise.resolve(balances.eth)
      }
    )
  })

  it('should default to zero eth balance, then update with current balance', async () => {
    expect.assertions(2)
    const { result, wait } = renderHook(() =>
      useGetTokenBalance(accountAddress)
    )

    expect(result.current.balances).toEqual({
      eth: '0',
    })

    await wait(() => {
      return result.current.balances.eth !== '0'
    })

    expect(result.current.balances).toEqual({
      eth: '12.506',
    })
  })

  it('should be able to query for additional token balances and update the existing table', async () => {
    expect.assertions(3)
    const { result, wait } = renderHook(() =>
      useGetTokenBalance(accountAddress)
    )

    expect(result.current.balances).toEqual({
      eth: '0',
    })

    result.current.getTokenBalance('0x1')

    await wait(() => {
      return !!result.current.balances['0x1']
    })

    expect(result.current.balances).toEqual({
      eth: '12.506',
      '0x1': '5',
    })

    result.current.getTokenBalance('0x2')

    await wait(() => {
      return !!result.current.balances['0x2']
    })

    expect(result.current.balances).toEqual(balances)
  })
})
