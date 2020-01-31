import { useDispatch } from 'react-redux'

import { useState } from 'react'
import { waitForWallet, dismissWalletCheck } from '../actions/fullScreenModals'

/**
 * This hooks marks a key as checked-in
 * By saving a check in data as metadata
 * @param {*} address
 */
export const useMarkAsCheckedIn = (walletService, config, key) => {
  const dispatch = useDispatch()
  const [checkedIn, setCheckedIn] = useState(false)
  const [error, setError] = useState(false)

  const markAsCheckedIn = () => {
    dispatch(waitForWallet())
    walletService.setKeyMetadata(
      {
        lockAddress: key.lock.address,
        keyId: key.keyId,
        metadata: {
          checkedInAt: new Date().getTime(),
        },
        locksmithHost: config.services.storage.host,
      },
      (error, saved) => {
        dispatch(dismissWalletCheck())
        if (error || !saved) {
          setError('There was an error to check this user in.')
          return
        }
        setCheckedIn(true)
        dispatch(dismissWalletCheck())
      }
    )
  }
  return { markAsCheckedIn, checkedIn, error }
}

export default useMarkAsCheckedIn
