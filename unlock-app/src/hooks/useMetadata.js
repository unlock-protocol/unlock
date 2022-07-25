import { useState, useEffect } from 'react'
import fetch from 'node-fetch'

const defaultMetadata = {
  image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
}

/**
 * This hook retrieves metadata for a token
 * @param {*} address
 */
export const useMetadata = (url) => {
  const [metadata, setMetadata] = useState(defaultMetadata)

  const getMetadata = async () => {
    if (url) {
      let tokenMetadata = defaultMetadata
      try {
        tokenMetadata = await fetch(url).then((response) => response.json())
      } catch (error) {
        // Do not fail on error, we'll keep defaulting to the default values
      }
      setMetadata(tokenMetadata)
    }
  }

  useEffect(() => {
    getMetadata()
  }, [url])
  return metadata
}

export default useMetadata
