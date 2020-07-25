import React from 'react'

/**
 * Function which creates higher order component with an instance of walletService
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const WalletServiceContext = React.createContext()

/**
 * This creates an HOC from a component and injects the walletService.
 * @param {*} Component
 */
export default function withWalletService(Component) {
  function componentWithWalletService(props) {
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
