// ABOUTME: Verifies keychain metadata loading from contract tokenURI responses.
// ABOUTME: Covers data URI metadata, remote metadata, IPFS images, and abort signal wiring.
import { renderHook } from '@testing-library/react-hooks'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useMetadata, {
  parseDataJsonUri,
  safeFetchJson,
} from '../../hooks/useMetadata'
import { Web3ServiceContext } from '../../utils/withWeb3Service'

const defaultMetadata = {
  image: '/images/svg/default-lock-logo.svg',
  name: 'NFT Membership',
}

const renderUseMetadata = (web3Service: {
  tokenURI: ReturnType<typeof vi.fn>
}) =>
  renderHook(() => useMetadata('0xlock', '1', 1), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        Web3ServiceContext.Provider,
        { value: web3Service },
        children
      ),
  })

describe('parseDataJsonUri', () => {
  it('parses base64 JSON tokenURI metadata', () => {
    const encoded = btoa(
      JSON.stringify({ image: 'ipfs://image-hash', name: 'Prime' })
    )

    expect(
      parseDataJsonUri(`data:application/json;base64,${encoded}`)
    ).toStrictEqual({
      image: 'ipfs://image-hash',
      name: 'Prime',
    })
  })

  it('parses url-encoded JSON tokenURI metadata', () => {
    const encoded = encodeURIComponent(
      JSON.stringify({ image: 'https://example.com/key.png' })
    )

    expect(parseDataJsonUri(`data:application/json,${encoded}`)).toStrictEqual({
      image: 'https://example.com/key.png',
    })
  })

  it('returns null for non data URI metadata', () => {
    expect(parseDataJsonUri('https://example.com/metadata.json')).toBeNull()
  })
})

describe('safeFetchJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    fetchMock.resetMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses JSON even when the endpoint has a non-standard content type', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ image: 'ipfs://remote-image' }), {
          headers: { 'content-type': 'text/plain' },
        })
      )
    )

    await expect(
      safeFetchJson('https://example.com/metadata')
    ).resolves.toEqual({
      image: 'ipfs://remote-image',
    })
  })

  it('passes a composed abort signal to fetch when an external signal is provided', async () => {
    const controller = new AbortController()
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ name: 'Remote NFT' }), {
        headers: { 'content-type': 'application/json' },
      })
    )
    vi.stubGlobal('fetch', fetch)

    await safeFetchJson('https://example.com/metadata', controller.signal)

    const init = fetch.mock.calls[0]?.[1]
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    expect(init?.signal).not.toBe(controller.signal)
  })
})

describe('useMetadata', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    fetchMock.resetMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns default metadata when token id is missing', () => {
    const web3Service = {
      tokenURI: vi.fn(),
    }

    const { result } = renderHook(() => useMetadata('0xlock'), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(
          Web3ServiceContext.Provider,
          { value: web3Service },
          children
        ),
    })

    expect(web3Service.tokenURI).not.toHaveBeenCalled()
    expect(result.current).toStrictEqual(defaultMetadata)
  })

  it('uses the image from data URI token metadata', async () => {
    const web3Service = {
      tokenURI: vi
        .fn()
        .mockResolvedValue(
          `data:application/json,${encodeURIComponent(
            JSON.stringify({ image: 'ipfs://key-image', name: 'Prime Key' })
          )}`
        ),
    }
    const { result, waitForNextUpdate } = renderUseMetadata(web3Service)

    await waitForNextUpdate()

    expect(web3Service.tokenURI).toHaveBeenCalledWith('0xlock', '1', 1)
    expect(fetch).not.toHaveBeenCalled()
    expect(result.current).toStrictEqual({
      image: 'https://ipfs.io/ipfs/key-image',
      name: 'Prime Key',
    })
  })

  it('fetches remote tokenURI metadata and rewrites the metadata image', async () => {
    const web3Service = {
      tokenURI: vi.fn().mockResolvedValue('ipfs://metadata-hash'),
    }
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ image: 'ipfs://remote-image', name: 'Remote Key' }),
        {
          headers: { 'content-type': 'application/json' },
        }
      )
    )
    vi.stubGlobal('fetch', fetch)

    const { result, waitForNextUpdate } = renderUseMetadata(web3Service)

    await waitForNextUpdate()

    expect(fetch).toHaveBeenCalledWith(
      'https://ipfs.io/ipfs/metadata-hash',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(result.current).toStrictEqual({
      image: 'https://ipfs.io/ipfs/remote-image',
      name: 'Remote Key',
    })
  })
})
