import { useState, useEffect } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { rewriteIpfsUrl } from '../utils/url'

type TokenMetadata = {
  image?: string
  name?: string
  [key: string]: any
}

const defaultMetadata: Required<Pick<TokenMetadata, 'image' | 'name'>> = {
  image: '/images/svg/default-lock-logo.svg',
  name: 'NFT Membership',
}

const parseDataJsonUri = (uri: string): TokenMetadata | null => {
  // data:application/json;base64,XXXX
  if (uri.startsWith('data:application/json;base64,')) {
    const b64 = uri.replace('data:application/json;base64,', '')
    try {
      const json = atob(b64)
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  // data:application/json,{"name":"...","image":"..."}
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

  // data:application/json;charset=utf-8,....
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

const safeFetchJson = async (url: string): Promise<TokenMetadata> => {
  const res = await fetch(url)

  // Algumas URIs retornam HTML, texto, ou content-type inesperado
  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()

  // Tenta JSON direto
  try {
    return JSON.parse(text)
  } catch {
    // Se o servidor respondeu JSON mas sem header correto, ainda tentamos
    if (contentType.includes('application/json')) {
      throw new Error('Invalid JSON response')
    }
    throw new Error(`Non-JSON response (${contentType || 'unknown'})`)
  }
}

/**
 * Retrieve NFT metadata for a lock key token
 */
export const useMetadata = (
  lockAddress: string,
  tokenId?: string,
  network?: number
) => {
  const [metadata, setMetadata] = useState<TokenMetadata>(defaultMetadata)
  const web3Service = useWeb3Service()

  useEffect(() => {
    const getMetadata = async () => {
      // Sem tokenId ou network, não tenta buscar nada
      if (!tokenId || !network) {
        setMetadata(defaultMetadata)
        return
      }

      let tokenMetadata: TokenMetadata = { ...defaultMetadata }

      try {
        const tokenURI = await web3Service.tokenURI(lockAddress, tokenId, network)

        // 1) data:application/json...
        const dataUriParsed = parseDataJsonUri(tokenURI)
        if (dataUriParsed) {
          tokenMetadata = dataUriParsed
        } else {
          // 2) http(s) / ipfs
          const url = rewriteIpfsUrl(tokenURI)
          tokenMetadata = await safeFetchJson(url)
        }

        // normaliza campos
        if (!tokenMetadata?.name) {
          tokenMetadata.name = defaultMetadata.name
        }

        // prioriza image, mas só reescreve se existir
        if (tokenMetadata?.image) {
          tokenMetadata.image = rewriteIpfsUrl(tokenMetadata.image)
        } else {
          tokenMetadata.image = defaultMetadata.image
        }
      } catch (error) {
        console.error(
          `We could not retrieve the metadata for ${lockAddress}, ${tokenId} on ${network}: ${String(
            error
          )}`
        )
        tokenMetadata = { ...defaultMetadata }
      }

      setMetadata(tokenMetadata)
    }

    getMetadata()
  }, [web3Service, lockAddress, tokenId, network])

  return metadata
}

export default useMetadata
