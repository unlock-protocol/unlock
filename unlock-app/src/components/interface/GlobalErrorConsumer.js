/* eslint-disable react/display-name */
import React from 'react'
import PropTypes from 'prop-types'

import {
  MissingProvider,
  WrongNetwork,
  MissingAccount,
} from '../creator/FatalError'
import { GlobalErrorContext } from '../../utils/GlobalErrorProvider'

export const defaultHandlers = {
  FATAL_MISSING_PROVIDER: () => <MissingProvider />,
  // eslint-disable-next-line react/prop-types
  FATAL_WRONG_NETWORK: ({ currentNetwork, requiredNetwork }) => (
    <WrongNetwork
      currentNetwork={currentNetwork}
      requiredNetwork={requiredNetwork}
    />
  ),
  FATAL_NO_USER_ACCOUNT: () => <MissingAccount />,
}

/**
 * create a wrapper that will display fatal errors instead of child content
 */
export const makeConsumer = (
  handlers = {},
  { Consumer } = GlobalErrorContext
) => {
  function GlobalErrorConsumer({ children }) {
    return (
      <Consumer>
        {({ error, errorMetadata }) => {
          if (!error) return <>{children}</>
          const errorHandler = handlers[error] || defaultHandlers[error]
          return errorHandler(errorMetadata, children)
        }}
      </Consumer>
    )
  }

  GlobalErrorConsumer.propTypes = {
    children: PropTypes.node.isRequired,
  }

  return GlobalErrorConsumer
}

export default makeConsumer()
