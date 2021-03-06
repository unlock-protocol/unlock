import React from 'react'
import { PaywallConfig } from '../unlockTypes'

export const PaywallConfigContext = React.createContext<PaywallConfig>(
  {} as PaywallConfig
)

export default PaywallConfigContext
