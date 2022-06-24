import { renderHook } from '@testing-library/react-hooks'
import useMetadata from '../../hooks/useMetadata'
import fetch from 'jest-fetch-mock'
const metadata = {
  image: 'https://...',
}

describe('useMetadata', () => {
  beforeEach(() => {
    fetch.resetMocks()
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        data: () => {
          return metadata
        },
      })
    })
  })

  it('should retrieve the default if there is no metadata uri', () => {
    expect.assertions(2)
    global.fetch = jest.fn(() => {})
    const tokenUri = ''
    const { result } = renderHook(() => useMetadata(tokenUri))

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current).toStrictEqual({
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
    })
  })

  it('should yield the metadata for the token', async () => {
    expect.assertions(2)
    const tokenUri = 'https://metadata'
    const { result, waitForNextUpdate } = renderHook(() =>
      useMetadata(tokenUri)
    )

    expect(result.current).toStrictEqual({
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
    })
    await waitForNextUpdate()
    expect(result.current).toStrictEqual(metadata)
  })

  it('should yield the default metadata for the token if metadata is not found', async () => {
    expect.assertions(1)
    global.fetch = jest.fn(() => {
      return Promise.reject()
    })
    const tokenUri = 'https://metadata'
    const { result } = renderHook(() => useMetadata(tokenUri))

    expect(result.current).toStrictEqual({
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
    })
  })
})
