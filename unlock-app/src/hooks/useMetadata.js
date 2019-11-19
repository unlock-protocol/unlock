import { useState, useEffect } from 'react'
import axios from 'axios'

const defaultMetadata = {
  image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
}

/**
 * This hook retrieves metadata for a token
 * @param {*} address
 */
export const useMetadata = url => {
  const [metadata, setMetadata] = useState(defaultMetadata)

  const getMetadata = async () => {
    let tokenMetadata = await axios.get(url).then(response => response.data)
    setMetadata(tokenMetadata)
  }

  useEffect(() => {
    getMetadata()
  })
  return metadata
}

export default useMetadata
