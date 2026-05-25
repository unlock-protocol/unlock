import { useState, useEffect } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { rewriteIpfsUrl } from '../utils/url'

type TokenMetadata = {
  image?: string
  image_url?: string
  name?: string
  [key: string]: unknown
}

const defaultMetadata: Required<Pick<TokenMetadata, 'image' | 'name'>> = {
  image: '/images/svg/default-lock-logo.svg',
  name: 'NFT Membership',
}

const jsonDataUriPattern = /^data:application\/json((?:;[^,]*)*),(.*)$/i

const parseJsonObject = (value: string): TokenMetadata | null => {
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null
  } catch {
    return null
  }
}

export const parseDataJsonUri = (uri: string): TokenMetadata | null => {
  const match = uri.match(jsonDataUriPattern)
  if (!match) {
    return null
  }

  const params = match[1].toLowerCase().split(';')
  const rawData = match[2]
  try {
    const json = params.includes('base64')
      ? window.atob(rawData)
      : decodeURIComponent(rawData)

    return parseJsonObject(json)
  } catch {
    return null
  }
}

export const normalizeTokenMetadata = (
  metadata: TokenMetadata | null
): Required<Pick<TokenMetadata, 'image' | 'name'>> & TokenMetadata => {
  const image = metadata?.image || metadata?.image_url
  return {
    ...metadata,
    image: image ? rewriteIpfsUrl(image) : defaultMetadata.image,
    name: metadata?.name || defaultMetadata.name,
  }
}

export const fetchTokenMetadata = async (
  tokenURI: string
): Promise<TokenMetadata | null> => {
  if (!tokenURI) {
    return null
  }

  const inlineMetadata = parseDataJsonUri(tokenURI)
  if (inlineMetadata) {
    return inlineMetadata
  }

  const response = await fetch(rewriteIpfsUrl(tokenURI))
  if (!response.ok) {
    throw new Error(`Metadata request failed with HTTP ${response.status}`)
  }

  return parseJsonObject(await response.text())
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
  const [metadata, setMetadata] = useState(defaultMetadata)
  const web3Service = useWeb3Service()

  useEffect(() => {
    let isMounted = true

    const getMetadata = async () => {
      let tokenMetadata = { ...defaultMetadata }
      try {
        if (!lockAddress || !tokenId || !network) {
          setMetadata(defaultMetadata)
          return
        }

        const tokenURI = await web3Service.tokenURI(
          lockAddress,
          tokenId,
          network
        )
        tokenMetadata = normalizeTokenMetadata(
          await fetchTokenMetadata(tokenURI)
        )
      } catch (error) {
        // Do not fail on error, we'll keep defaulting to the default values
        console.error(
          `We could not retrieve the metadata for ${lockAddress}, ${tokenId} on ${network}: ${error}`
        )
      }
      if (isMounted) {
        setMetadata(tokenMetadata)
      }
    }
    getMetadata()

    return () => {
      isMounted = false
    }
  }, [web3Service, lockAddress, tokenId, network])
  return metadata
}

export default useMetadata
