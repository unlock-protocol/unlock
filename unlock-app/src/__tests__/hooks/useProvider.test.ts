import { renderHook } from '@testing-library/react-hooks'
import * as Redux from 'react-redux'
import React from 'react'
import { useProvider } from '../../hooks/useProvider'
import { ConfigContext } from '../../utils/withConfig'

jest.spyOn(Redux, 'useSelector').mockImplementation(selector => {
  return selector({
    provider: 'Unlock',
  })
})

jest.spyOn(React, 'useContext').mockImplementation(context => {
  if (context === ConfigContext) {
    return {
      providers: {
        Unlock: {},
      },
    }
  }
})

describe('useProvider', () => {
  it('returns a provider', () => {
    expect.assertions(1)

    const { result } = renderHook(() => useProvider())

    expect(result.current).toEqual({
      provider: expect.any(Object),
    })
  })
})
