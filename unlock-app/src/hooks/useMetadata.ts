import { useState, useEffect } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { rewriteIpfsUrl } from '../utils/url'

type TokenMetadata = {
  image?: string
  name?: string
  [key: string]: unknown
}

const defaultMetadata: Required<Pick<TokenMetadata, 'image' | 'name'>> = {
  image: '/images/svg/default-lock-logo.svg',
  name: 'NFT Membership',
}

/**
 * Parse data:application/json URIs
 */
export const parseDataJsonUri = (uri: string): TokenMetadata | null => {
  if (!uri) return null

  if (uri.startsWith('data:application/json;base64,')) {
    const b64 = uri.replace('data:application/json;base64,', '')
    try {
      const json = atob(b64)
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  if (uri.startsWith('data:application/json,')) {
    const raw = uri.replace('data:application/json,', '')
    try {
      return JSON.parse(decodeURIComponent(raw))
    } catch {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }
  }

  if (uri.startsWith('data:application/json;')) {
    const commaIndex = uri.indexOf(',')
    if (commaIndex > -1) {
      const raw = uri.slice(commaIndex + 1)
      try {
        return JSON.parse(decodeURIComponent(raw))
      } catch {
        try {
          return JSON.parse(raw)
        } catch {
          return null
        }
      }
    }
  }

  return null
}

/**
 * Fetch JSON with timeout protection
 */
const fetchWithTimeout = async (
  url: string,
  timeout = 8000,
  signal?: AbortSignal
): Promise<Response> => {
  const controller = new AbortController()

  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      signal: signal ?? controller.signal,
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Safely fetch JSON metadata
 */
export const safeFetchJson = async (
  url: string,
  signal?: AbortSignal
): Promise<TokenMetadata> => {
  const res = await fetchWithTimeout(url, 8000, signal)

  if (!res.ok) {
    throw new Error(`Metadata request failed: ${res.status}`)
  }

  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch {
    if (contentType.includes('application/json')) {
      throw new Error('Invalid JSON response')
    }

    throw new Error(`Non JSON response (${contentType || 'unknown'})`)
  }
}

/**
 * React hook to retrieve NFT metadata
 */
export const useMetadata = (
  lockAddress: string,
  tokenId?: string,
  network?: number
) => {
  const [metadata, setMetadata] = useState<TokenMetadata>(defaultMetadata)

  const web3Service = useWeb3Service()

  useEffect(() => {
    const controller = new AbortController()

    const getMetadata = async () => {
      if (!tokenId || network === undefined) {
        setMetadata(defaultMetadata)
        return
      }

      let tokenMetadata: TokenMetadata = { ...defaultMetadata }

      try {
        const tokenURI = await web3Service.tokenURI(
          lockAddress,
          tokenId,
          network
        )

        const parsed = parseDataJsonUri(tokenURI)

        if (parsed) {
          tokenMetadata = {
            ...defaultMetadata,
            ...parsed,
          }
        } else {
          const url = rewriteIpfsUrl(tokenURI)
          tokenMetadata = await safeFetchJson(url, controller.signal)
        }

        if (!tokenMetadata?.name) {
          tokenMetadata.name = defaultMetadata.name
        }

        if (tokenMetadata?.image) {
          tokenMetadata.image = rewriteIpfsUrl(tokenMetadata.image)
        } else {
          tokenMetadata.image = defaultMetadata.image
        }

        if (!controller.signal.aborted) {
          setMetadata(tokenMetadata)
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          console.error(
            `Metadata error for ${lockAddress} ${tokenId} on ${network}`,
            error
          )

          setMetadata(defaultMetadata)
        }
      }
    }

    getMetadata()

    return () => {
      controller.abort()
    }
  }, [web3Service, lockAddress, tokenId, network])

  return metadata
}

export default useMetadata
