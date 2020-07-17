import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import {
  useFiatKeyPrices,
  keyPricesReducer,
} from '../../hooks/useFiatKeyPrices'
import { ConfigContext } from '../../utils/withConfig'

describe('useFiatKeyPrices', () => {
  beforeEach(() => {
    fetch.resetMocks()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === ConfigContext) {
        return {
          services: {
            storage: {
              host: 'https://locksmith',
            },
          },
        }
      }
    })
  })

  it('should return an empty object by default', () => {
    expect.assertions(1)

    const { result } = renderHook(() => useFiatKeyPrices([]))

    expect(result.current).toEqual({})
  })

  it('should fetch fiat prices from locksmith', async () => {
    expect.assertions(1)

    fetch.mockResponseOnce(JSON.stringify({ usd: '123.45' }))

    const { result, wait } = renderHook(() =>
      useFiatKeyPrices(['0xlockaddress'])
    )

    await wait(() => {
      return Object.keys(result.current).length > 0
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://locksmith/price/fiat/0xlockaddress'
    )
  })

  it('should resolve with an object of locks and associated prices', async () => {
    expect.assertions(1)

    fetch.mockResponseOnce(JSON.stringify({ usd: '123.45' }))

    const { result, wait } = renderHook(() =>
      useFiatKeyPrices(['0xlockaddress'])
    )

    await wait(() => {
      return Object.keys(result.current).length > 0
    })

    expect(result.current).toEqual({
      '0xlockaddress': {
        usd: '123.45',
      },
    })
  })

  describe('keyPricesReducer', () => {
    it('does not update state when price update is empty', () => {
      expect.assertions(1)

      expect(
        keyPricesReducer({}, { lockAddress: '0xwhatever', prices: {} })
      ).toEqual({})
    })
  })
})
