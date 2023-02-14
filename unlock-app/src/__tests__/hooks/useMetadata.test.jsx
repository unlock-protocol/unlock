import { renderHook } from '@testing-library/react-hooks'
import useMetadata from '../../hooks/useMetadata'
import { fetchJson } from 'ethers/lib/utils'
import { vi } from 'vitest'



describe('useMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks
  })
  it('should retrieve the default if there is no metadata uri', () => {
    expect.assertions(2)
    vi.fn = vi.fn(() => { })
    const tokenUri = ''
    const { result } = renderHook(() => useMetadata(tokenUri))

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current).toStrictEqual({
      image: '/images/svg/default-lock-logo.svg',
    })
  })

  it.skip('should yield the metadata for the token', async () => {
    expect.assertions(2)
    const tokenUri = 'https://metadata'

    const { result, waitForNextUpdate } = renderHook(() =>
      useMetadata(tokenUri)
    )
    expect(result.current).toStrictEqual({
      image: '/images/svg/default-lock-logo.svg',
    })

    await waitForNextUpdate()

    expect(result.current).toStrictEqual(metadata)
  })
  it('should yield the default metadata for the token if metadata is not found', async () => {
    expect.assertions(1)
    vi.fn = vi.fn(() => { })
    const tokenUri = 'https://metadata'
    const { result } = renderHook(() => useMetadata(tokenUri))
    expect(result.current).toStrictEqual({
      image: '/images/svg/default-lock-logo.svg',
    })
  })
})
