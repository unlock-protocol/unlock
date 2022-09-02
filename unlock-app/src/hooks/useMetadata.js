import { useState, useEffect } from 'react'
import fetch from 'node-fetch'
import { useWeb3Service } from '~/utils/withWeb3Service'

const defaultMetadata = {
  image: '',
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
        let url = new URL(tokenURI)
        // Handling IPFS addresses
        // TODO: add detection when IPFS is supported!
        if (url.protocol === 'ipfs:') {
          url.protocol = 'https:'
          url.hostname = 'cloudflare-ipfs.com'
          url.pathname = `/ipfs${url.pathname}`
        }
        tokenMetadata = await fetch(url).then((response) => response.json())
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
