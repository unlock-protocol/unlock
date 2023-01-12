import { Web3Service } from '@unlock-protocol/unlock-js'
import React, { useContext } from 'react'

/**
 * Function which creates higher order component with an instance of web3Service
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const Web3ServiceContext = React.createContext<Web3Service | any>(null)

/**
 * This creates an HOC from a component and injects the web3Service.
 * @param {*} Component
 */
export default function withWeb3Service(Component: any) {
  function componentWithWeb3Service(props: any) {
    return (
      <Web3ServiceContext.Consumer>
        {(web3Service) => <Component {...props} web3Service={web3Service} />}
      </Web3ServiceContext.Consumer>
    )
  }
  return componentWithWeb3Service
}

export function useWeb3Service(): Web3Service {
  const web3Service = useContext(Web3ServiceContext)
  return web3Service!
}
