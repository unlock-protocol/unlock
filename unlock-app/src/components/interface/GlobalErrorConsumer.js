/* eslint-disable react/display-name */
import React, { createContext } from 'react'
import {
  MissingProvider,
  WrongNetwork,
  MissingAccount,
} from '../creator/FatalError'

// this is a dummy value, to be replaced with the actual global error context when merging PRs
export const DummyContext = createContext({})

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
export const makeConsumer = (handlers = {}, { Consumer } = DummyContext) =>
  function GlobalErrorConsumer({ children }) {
    return (
      <Consumer>
        {({ error, errorMetadata }) => {
          if (!error) return <>{children}</>
          const errorHandler = handlers[error] || defaultHandlers[error]
          return errorHandler(errorMetadata)
        }}
      </Consumer>
    )
  }

export default makeConsumer()
