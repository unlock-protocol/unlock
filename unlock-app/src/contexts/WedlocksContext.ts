import React, { useContext } from 'react'
import WedlockService from '../services/wedlockService'

export const WedlockServiceContext = React.createContext<
  WedlockService | undefined
>(undefined)

export const useWedlockService = () => {
  const wedlockService = useContext(WedlockServiceContext)
  if (!wedlockService) {
    throw new Error('Wedlock service not provided by provider')
  }
  return wedlockService
}

export default WedlockServiceContext
