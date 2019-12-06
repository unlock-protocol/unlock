import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { signBulkMetadataRequest } from '../actions/keyMetadata'

/**
 * This hook retrieves metadata for a token
 * @param {*} address
 */
export const useGetMetadataFor = (lockAddress, keyOwner) => {
  const { account, metadata } = useSelector(state => state)
  const dispatch = useDispatch()

  useMemo(() => {
    if (account) {
      // TODO Use a request which does not need to get all of the metadata for all of the keys!
      dispatch(signBulkMetadataRequest(lockAddress, account.address))
    }
  }, [lockAddress, account])

  return (metadata[lockAddress] && metadata[lockAddress][keyOwner]) || {}
}

export default useGetMetadataFor
