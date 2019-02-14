import React from 'react'
import PropTypes from 'prop-types'
import { ConfigContext } from '../utils/useConfig'

export default function Config({ children }) {
  return <ConfigContext.Provider>{children}</ConfigContext.Provider>
}

Config.propTypes = {
  children: PropTypes.node.isRequired,
}
