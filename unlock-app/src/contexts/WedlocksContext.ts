import React from 'react'
import WedlockService from '../services/wedlockService'

export const WedlockServiceContext = React.createContext<
  WedlockService | undefined
>(undefined)

export default WedlockServiceContext
