import PropTypes from 'prop-types'
import React, { createContext } from 'react'

import web3Service from '../../services/web3Service'

export const Web3ServiceContext = createContext()

export default function Web3Service({ children }) {
  const { Provider } = Web3ServiceContext
  const web3 = new web3Service()
  return <Provider value={web3}>{children}</Provider>
}

Web3Service.propTypes = {
  children: PropTypes.node.isRequired,
}
