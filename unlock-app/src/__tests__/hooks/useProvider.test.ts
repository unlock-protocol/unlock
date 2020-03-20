import { renderHook } from '@testing-library/react-hooks'
import * as Redux from 'react-redux'
import { useProvider } from '../../hooks/useProvider'

jest.spyOn(Redux, 'useSelector').mockImplementation(() => {
  return {}
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
