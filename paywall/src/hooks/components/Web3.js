import React, { createContext } from 'react'
import Web3Object from 'web3'
import PropTypes from 'prop-types'
import useConfig from '../utils/useConfig'

export const ReadOnlyContext = createContext()

export default function Web3({ children }) {
  const { readOnlyProvider, providers } = useConfig()

  let web3
  if (readOnlyProvider) {
    web3 = new Web3Object(readOnlyProvider)
  } else {
    web3 = new Web3Object(Object.values(providers)[0]) // Defaulting to the first provider.
  }

  return (
    <ReadOnlyContext.Provider value={web3}>{children}</ReadOnlyContext.Provider>
  )
}

Web3.propTypes = {
  children: PropTypes.node.isRequired,
}
