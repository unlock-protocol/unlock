import { WalletService } from '@unlock-protocol/unlock-js'
import React, { useContext } from 'react'

/**
 * Function which creates higher order component with an instance of walletService
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const WalletServiceContext = React.createContext<null | WalletService>(
  null
)

/**
 * This creates an HOC from a component and injects the walletService.
 * @param {*} Component
 */
export default function withWalletService(Component: any) {
  function componentWithWalletService(props: any) {
    return (
      <WalletServiceContext.Consumer>
        {(walletService) => (
          <Component {...props} walletService={walletService} />
        )}
      </WalletServiceContext.Consumer>
    )
  }
  return componentWithWalletService
}

export function useWalletService() {
  const walletService = useContext(WalletServiceContext)
  return walletService!
}
