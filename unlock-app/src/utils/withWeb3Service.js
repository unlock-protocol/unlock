import React from 'react'

/**
 * Function which creates higher order component with an instance of web3Service
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const Web3ServiceContext = React.createContext()

/**
 * This creates an HOC from a component and injects the web3Service.
 * @param {*} Component
 */
export default function withWeb3Service(Component) {
  function componentWithWeb3Service(props) {
    return (
      <Web3ServiceContext.Consumer>
        {(web3Service) => <Component {...props} web3Service={web3Service} />}
      </Web3ServiceContext.Consumer>
    )
  }
  return componentWithWeb3Service
}
