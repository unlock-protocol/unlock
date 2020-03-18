import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useFiatKeyPrices } from '../../hooks/useFiatKeyPrices'
import { ConfigContext } from '../../utils/withConfig'

const getFetch = (): any => {
  return fetch as any
}

describe('useFiatKeyPrices', () => {
  beforeEach(() => {
    getFetch().resetMocks()

    jest.spyOn(React, 'useContext').mockImplementation(context => {
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

    getFetch().mockResponseOnce(JSON.stringify({ data: '12345' }))

    const { result, wait } = renderHook(() =>
      useFiatKeyPrices(['0xlockaddress'])
    )

    wait(() => {
      return Object.keys(result.current).length > 0
    })

    expect(result.current).toEqual({})
  })
})
