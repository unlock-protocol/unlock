import { renderHook } from '@testing-library/react-hooks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useMetadata, {
  fetchTokenMetadata,
  normalizeTokenMetadata,
  parseDataJsonUri,
} from '../../hooks/useMetadata'

const mockWeb3Service = {
  tokenURI: vi.fn(),
}

vi.mock('~/utils/withWeb3Service', () => ({
  useWeb3Service: () => mockWeb3Service,
}))

const defaultMetadata = {
  image: '/images/svg/default-lock-logo.svg',
  name: 'NFT Membership',
}

describe('parseDataJsonUri', () => {
  it('parses plain JSON data URIs', () => {
    const metadata = {
      name: 'Prime Key',
      image: 'ipfs://prime-image',
    }
    const uri = `data:application/json,${encodeURIComponent(
      JSON.stringify(metadata)
    )}`

    expect(parseDataJsonUri(uri)).toStrictEqual(metadata)
  })

  it('parses base64 JSON data URIs', () => {
    const metadata = {
      name: 'Prime Key',
      image: 'ipfs://prime-image',
    }
    const uri = `data:application/json;base64,${window.btoa(
      JSON.stringify(metadata)
    )}`

    expect(parseDataJsonUri(uri)).toStrictEqual(metadata)
  })

  it('ignores non-JSON data URIs', () => {
    expect(parseDataJsonUri('data:text/plain,hello')).toBeNull()
  })
})

describe('fetchTokenMetadata', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not fetch when tokenURI is inline JSON metadata', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const metadata = {
      name: 'Inline Key',
      image: 'ipfs://inline-image',
    }
    const uri = `data:application/json,${encodeURIComponent(
      JSON.stringify(metadata)
    )}`

    await expect(fetchTokenMetadata(uri)).resolves.toStrictEqual(metadata)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('normalizeTokenMetadata', () => {
  it('rewrites token image fields and preserves defaults for missing values', () => {
    expect(
      normalizeTokenMetadata({
        image: 'ipfs://metadata-image',
      })
    ).toStrictEqual({
      image: 'https://ipfs.io/ipfs/metadata-image',
      name: 'NFT Membership',
    })
  })

  it('uses image_url when image is missing', () => {
    expect(
      normalizeTokenMetadata({
        image_url: 'ipfs://metadata-image-url',
        name: 'Image URL Key',
      })
    ).toStrictEqual({
      image: 'https://ipfs.io/ipfs/metadata-image-url',
      image_url: 'ipfs://metadata-image-url',
      name: 'Image URL Key',
    })
  })
})

describe('useMetadata', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockWeb3Service.tokenURI.mockReset()
  })

  it('retrieves key tokenURI metadata for keychain cards', async () => {
    const metadata = {
      image: 'ipfs://key-image',
      name: 'Key Metadata',
    }
    mockWeb3Service.tokenURI.mockResolvedValue(
      `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`
    )

    const { result, waitForNextUpdate } = renderHook(() =>
      useMetadata('0xlock', '42', 8453)
    )

    expect(result.current).toStrictEqual(defaultMetadata)

    await waitForNextUpdate()

    expect(mockWeb3Service.tokenURI).toHaveBeenCalledWith('0xlock', '42', 8453)
    expect(result.current).toStrictEqual({
      image: 'https://ipfs.io/ipfs/key-image',
      name: 'Key Metadata',
    })
  })

  it('keeps the default metadata when the key tokenURI cannot be loaded', async () => {
    mockWeb3Service.tokenURI.mockRejectedValue(new Error('missing metadata'))

    const { result, waitForNextUpdate } = renderHook(() =>
      useMetadata('0xlock', '42', 8453)
    )

    await waitForNextUpdate()

    expect(result.current).toStrictEqual(defaultMetadata)
  })
})
