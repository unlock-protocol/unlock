import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useFiatKeyPrices } from '../../hooks/useFiatKeyPrices'
import { ConfigContext } from '../../utils/withConfig'

describe('useFiatKeyPrices', () => {
  beforeEach(() => {
    fetch.resetMocks()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === ConfigContext) {
        return {
          networks: {
            1: {
              locksmith: 'https://locksmith',
            },
          },
        }
      }
    })
  })

  it('should return an empty object by default', () => {
    expect.assertions(1)

    const { result } = renderHook(() => useFiatKeyPrices(''))

    expect(result.current).toEqual({
      fiatPrices: {},
      loading: true,
    })
  })

  it('should fetch fiat prices from locksmith', async () => {
    expect.assertions(1)

    fetch.mockResponseOnce(JSON.stringify({ usd: '123.45' }))

    const { result, waitFor } = renderHook(() =>
      useFiatKeyPrices('0xlockaddress', 1)
    )

    await waitFor(() => {
      return Object.keys(result.current).length > 0
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://locksmith/price/fiat/0xlockaddress'
    )
  })

  it('should resolve with an object of locks and associated prices', async () => {
    expect.assertions(1)

    fetch.mockResponseOnce(JSON.stringify({ usd: '123.45' }))

    const { result, waitFor } = renderHook(() =>
      useFiatKeyPrices('0xlockaddress', 1)
    )

    await waitFor(() => {
      return Object.keys(result.current).length > 0
    })

    expect(result.current).toEqual({
      fiatPrices: {
        usd: '123.45',
      },
      loading: false,
    })
  })
})
