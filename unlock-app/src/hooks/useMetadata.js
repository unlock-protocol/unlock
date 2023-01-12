import { useState, useEffect } from 'react'
import fetch from 'node-fetch'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { rewriteIpfsUrl } from '../utils/url'

const defaultMetadata = {
  image: '/images/svg/default-lock-logo.svg',
}

/**
 * This hook retrieves metadata for a token
 * @param {*} address
 */
export const useMetadata = (lockAddress, tokenId, network) => {
  const [metadata, setMetadata] = useState(defaultMetadata)
  const web3Service = useWeb3Service()

  useEffect(() => {
    const getMetadata = async () => {
      let tokenMetadata = defaultMetadata
      try {
        const tokenURI = await web3Service.tokenURI(
          lockAddress,
          tokenId,
          network
        )
        tokenMetadata = await fetch(rewriteIpfsUrl(tokenURI)).then((response) =>
          response.json()
        )
        tokenMetadata.image = rewriteIpfsUrl(tokenMetadata.image)
      } catch (error) {
        // Do not fail on error, we'll keep defaulting to the default values
        console.error(
          `We could not retrieve the metadata for ${lockAddress}, ${tokenId} on ${network}: ${error}`
        )
      }
      setMetadata(tokenMetadata)
    }
    getMetadata()
  }, [web3Service, lockAddress, tokenId, network])
  return metadata
}

export default useMetadata
