import React from 'react'
import { EventEmitter } from 'events'
import { renderHook } from '@testing-library/react-hooks'
import fetch from 'jest-fetch-mock'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import { useCards } from '../../hooks/useCards'

class MockWalletService extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWalletService: any

const locksmithHost = 'https://locksmith'
const userAddress = '0xuser'
const emailAddress = 'ted@nelson.xanadu'

const account = {
  address: userAddress,
  emailAddress,
  balance: '5',
}

describe('useCards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetch.resetMocks()

    jest.spyOn(React, 'useContext').mockImplementation(context => {
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
    mockWalletService.unformattedSignTypedData = jest
      .fn()
      .mockResolvedValue('a signature')
  })

  it('should call WalletService.unformattedSignTypedData with the correct values', async () => {
    expect.assertions(1)

    fetch.mockResolvedValue({
      json: () => Promise.resolve([]),
    } as any)

    const { result, wait } = renderHook(() => useCards(account.address))

    await wait(() => !!result.current.cards)

    expect(mockWalletService.unformattedSignTypedData).toHaveBeenCalledWith(
      account.address,
      expect.any(Object)
    )
  })

  it('should return an error when the fetch fails', async () => {
    expect.assertions(1)

    fetch.mockRejectedValue(new Error('fail'))

    const { result, wait } = renderHook(() => useCards(account.address))

    await wait(() => !!result.current.error)

    expect(result.current.error!.message).toEqual('fail')
  })
})
