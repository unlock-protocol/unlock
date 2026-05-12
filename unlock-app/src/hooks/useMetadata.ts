// ABOUTME: Fetches NFT metadata for keychain tokens from contract tokenURI values.
// ABOUTME: Handles data URI metadata, remote JSON, IPFS image URLs, and aborted fetches.
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

const parseJson = (text: string): TokenMetadata | null => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const parseDataJsonUri = (uri: string): TokenMetadata | null => {
  if (!uri.startsWith('data:application/json')) {
    return null
  }

  const commaIndex = uri.indexOf(',')

  if (commaIndex === -1) {
    return null
  }

  const metadata = uri.slice(0, commaIndex).toLowerCase()
  const data = uri.slice(commaIndex + 1)

  try {
    const json = metadata.includes(';base64')
      ? atob(data)
      : decodeURIComponent(data)
    return parseJson(json)
  } catch {
    return parseJson(data)
  }
}

const createCombinedAbortSignal = (signals: AbortSignal[]) => {
  const activeSignals = signals.filter(Boolean)

  if (activeSignals.length === 1) {
    return activeSignals[0]
  }

  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any(activeSignals)
  }

  const controller = new AbortController()

  for (const signal of activeSignals) {
    if (signal.aborted) {
      controller.abort()
      break
    }

    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  return controller.signal
}

const fetchWithTimeout = async (
  url: string,
  timeout = 8000,
  signal?: AbortSignal
) => {
  const timeoutController = new AbortController()
  const timer = setTimeout(() => timeoutController.abort(), timeout)
  const signals = signal
    ? [timeoutController.signal, signal]
    : [timeoutController.signal]

  try {
    return await fetch(url, {
      signal: createCombinedAbortSignal(signals),
    })
  } finally {
    clearTimeout(timer)
  }
}

export const safeFetchJson = async (
  url: string,
  signal?: AbortSignal
): Promise<TokenMetadata> => {
  const response = await fetchWithTimeout(url, 8000, signal)

  if (!response.ok) {
    throw new Error(`Metadata request failed: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  const metadata = parseJson(text)

  if (metadata) {
    return metadata
  }

  throw new Error(`Invalid metadata JSON (${contentType || 'unknown'})`)
}

/**
 * This hook retrieves metadata for a token
 * @param {*} address
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

      try {
        const tokenURI = await web3Service.tokenURI(
          lockAddress,
          tokenId,
          network
        )
        const parsedMetadata = parseDataJsonUri(tokenURI)
        const tokenMetadata = parsedMetadata
          ? {
              ...defaultMetadata,
              ...parsedMetadata,
            }
          : await safeFetchJson(rewriteIpfsUrl(tokenURI), controller.signal)

        const nextMetadata = {
          ...defaultMetadata,
          ...tokenMetadata,
          image: tokenMetadata.image
            ? rewriteIpfsUrl(tokenMetadata.image)
            : defaultMetadata.image,
        }

        if (!controller.signal.aborted) {
          setMetadata(nextMetadata)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          // Do not fail on error, we'll keep defaulting to the default values
          console.error(
            `We could not retrieve the metadata for ${lockAddress}, ${tokenId} on ${network}: ${error}`
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
