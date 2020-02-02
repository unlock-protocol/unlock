import { useDispatch } from 'react-redux'

import { useEffect, useState } from 'react'
import { waitForWallet, dismissWalletCheck } from '../actions/fullScreenModals'

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
  const dispatch = useDispatch()

  useEffect(() => {
    const getMetadata = async () => {
      setLoading(true)
      if (getProtectedData) {
        dispatch(waitForWallet())
      }
      walletService.getKeyMetadata(
        {
          lockAddress,
          keyId,
          locksmithHost: config.services.storage.host,
          getProtectedData,
        },
        (error, json) => {
          setLoading(false)
          if (error) {
            setError(error)
          } else {
            setMetadata(json)
          }
          dispatch(dismissWalletCheck())
        }
      )
    }
    getMetadata()
  }, [lockAddress, keyId])

  return { loading, metadata, error }
}

export default useGetMetadataFor
