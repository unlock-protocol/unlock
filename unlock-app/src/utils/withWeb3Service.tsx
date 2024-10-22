import { Web3Service } from '@unlock-protocol/unlock-js'
import React, { useContext } from 'react'

/**
 * Function which creates higher order component with an instance of web3Service
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const Web3ServiceContext = React.createContext<Web3Service | any>(null)

export function useWeb3Service(): Web3Service {
  const web3Service = useContext(Web3ServiceContext)
  return web3Service!
}
