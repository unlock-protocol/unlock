// @vitest-environment jsdom

import { renderHook, act } from '@testing-library/react-hooks'
import useTermsOfService, {
  localStorageKey,
} from '../../hooks/useTermsOfService'
import { vi } from 'vitest'

describe.skip('useTermsOfService', () => {
  beforeAll(() => {
    vi.resetAllMocks()
  })

  it('should default to false if no value is set in localtorage', async () => {
    expect.assertions(1)
    const { result } = renderHook(() => useTermsOfService())
    const termsAccepted = result.current.termsAccepted
    expect(termsAccepted).toBe(false)
  })

  it('should return true if the correct value is set in localstorage', async () => {
    expect.assertions(1)
    localStorage.setItem(localStorageKey, 'true')
    const { result } = renderHook(() => useTermsOfService())
    const termsAccepted = result.current.termsAccepted
    expect(termsAccepted).toBe(true)
  })

  it('should return false if the value in localstorage is not correct', async () => {
    expect.assertions(1)
    localStorage.setItem(localStorageKey, 'hello')
    const { result } = renderHook(() => useTermsOfService())
    const termsAccepted = result.current.termsAccepted
    expect(termsAccepted).toBe(false)
  })

  it('should return false if localstorage could not be read', async () => {
    expect.assertions(1)

    // eslint-disable-next-line no-proto
    vi.spyOn(localStorage.__proto__, 'getItem').mockImplementationOnce(() => {
      throw new Error()
    })

    const { result } = renderHook(() => useTermsOfService())
    const termsAccepted = result.current.termsAccepted
    expect(termsAccepted).toBe(false)
  })

  it('should set the value in localstorage', async () => {
    expect.assertions(1)
    const { result } = renderHook(() => useTermsOfService())
    const saveTermsAccepted = result.current.saveTermsAccepted
    act(() => {
      saveTermsAccepted()
    })
    const savedValue = localStorage.getItem(localStorageKey)
    expect(savedValue).toBe('true')
  })
})
