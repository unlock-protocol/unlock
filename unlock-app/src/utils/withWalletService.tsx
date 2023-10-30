import { WalletService } from '@unlock-protocol/unlock-js'
import React from 'react'

/**
 * Function which creates higher order component with an instance of walletService
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const WalletServiceContext = React.createContext<null | WalletService>(
  null
)
