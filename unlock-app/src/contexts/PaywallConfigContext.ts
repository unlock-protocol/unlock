import React from 'react'
import { PaywallConfig } from '../unlockTypes'

export const PaywallConfigContext = React.createContext<
  PaywallConfig | undefined
>(undefined)

export default PaywallConfigContext
