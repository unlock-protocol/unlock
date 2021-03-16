import { useEffect, useState, useContext } from 'react'
import { AuthenticationContext } from '../components/interface/Authenticate'

/**
 * This hook retrieves metadata for a token
 * @param {*} lockAddress
 * @param {*} keyId
 * @param {*} getProtectedData
 */
export const useGetMetadataFor = (
  walletService,
  config,
  lockAddress,
  keyId,
  getProtectedData
) => {
  const [metadata, setMetadata] = useState({
    userMetadata: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { network } = useContext(AuthenticationContext)

  useEffect(() => {
    const getMetadata = async () => {
      setLoading(true)
      walletService.getKeyMetadata(
        {
          lockAddress,
          keyId,
          locksmithHost: config.networks[network].locksmith,
          getProtectedData,
        },
        (error, json) => {
          setLoading(false)
          if (error) {
            setError(error)
          } else {
            setMetadata(json)
          }
        }
      )
    }
    getMetadata()
  }, [lockAddress, keyId])

  return { loading, metadata, error }
}

export default useGetMetadataFor
