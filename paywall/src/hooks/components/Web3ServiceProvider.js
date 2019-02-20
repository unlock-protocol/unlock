import PropTypes from 'prop-types'
import React, { createContext } from 'react'

import useConfig from '../utils/useConfig'
import web3Service from '../../services/web3Service'

export const Web3ServiceContext = createContext()

export default function Web3ServiceProvider({ children }) {
  const { Provider } = Web3ServiceContext
  const { unlockAddress } = useConfig()
  const web3 = new web3Service(unlockAddress)
  return <Provider value={web3}>{children}</Provider>
}

Web3ServiceProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
