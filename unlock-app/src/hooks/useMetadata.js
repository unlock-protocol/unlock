import { useState, useEffect } from 'react'
// import axios from 'axios'

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
        tokenMetadata = await fetch(url, { method: 'GET' }).then(
          (response) => response.data
        )
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
