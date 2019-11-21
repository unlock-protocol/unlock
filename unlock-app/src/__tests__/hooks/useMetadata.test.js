import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'
import useMetadata from '../../hooks/useMetadata'

jest.mock('axios')

const metadata = {
  image: 'https://...',
}

describe('useMetadata', () => {
  beforeAll(() => {
    axios.get = jest.fn(() => {
      return Promise.resolve({
        data: () => {
          return metadata
        },
      })
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
    axios.get = jest.fn(() => {
      return Promise.reject()
    })
    const tokenUri = 'https://metadata'
    const { result } = renderHook(() => useMetadata(tokenUri))

    expect(result.current).toStrictEqual({
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
    })
  })
})
