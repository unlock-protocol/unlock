import { renderHook, act } from '@testing-library/react-hooks'
import useTermsOfService, {
  localStorageKey,
} from '../../hooks/useTermsOfService'

describe('useTermsOfService', () => {
  beforeAll(() => {})

  it('should default to false if no value is set in localtorage', async () => {
    expect.assertions(1)
    const { result } = renderHook(() => useTermsOfService())
    const termsAccepted = result.current[0]
    expect(termsAccepted).toBe(false)
  })

  it('should return true if the correct value is set in localstorage', async () => {
    expect.assertions(1)
    window.localStorage.setItem(localStorageKey, 'true')
    const { result } = renderHook(() => useTermsOfService())
    const termsAccepted = result.current[0]
    expect(termsAccepted).toBe(true)
  })

  it('should return false if the value in localstorage is not correct', async () => {
    expect.assertions(1)
    window.localStorage.setItem(localStorageKey, 'hello')
    const { result } = renderHook(() => useTermsOfService())
    const termsAccepted = result.current[0]
    expect(termsAccepted).toBe(false)
  })

  it('should set the value in localstorage', async () => {
    expect.assertions(1)
    const { result } = renderHook(() => useTermsOfService())
    const acceptTerms = result.current[1]
    act(() => {
      acceptTerms()
    })
    const savedValue = window.localStorage.getItem(localStorageKey)
    expect(savedValue).toBe('true')
  })
})
