import React from 'react'

/**
 * Function which creates higher order component with an instance of walletService
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const GraphServiceContext = React.createContext()

/**
 * This creates an HOC from a component and injects the walletService.
 * @param {*} Component
 */
export default function withGraphService(Component) {
  function componentWithGraphService(props) {
    return (
      <GraphServiceContext.Consumer>
        {(walletService) => (
          <Component {...props} walletService={walletService} />
        )}
      </GraphServiceContext.Consumer>
    )
  }
  return componentWithGraphService
}
