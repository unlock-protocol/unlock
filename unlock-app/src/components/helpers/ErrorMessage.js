import React from 'react'

/**
 * Once we do localization we can map error names to different messages based on
 * the user's language
 */

const genericError = message => (
  <p>
    There was an error ({message}). Please retry and report if it happens again.
  </p>
)

const defaultMessages = {
  MISSING_PROVIDER: <p>You need a web3 provider to use Unlock.</p>,
  MISSING_TRANSACTION: (
    <p>
      The transaction you are looking for is missing. Are you on the right
      network?
    </p>
  ),
  NOT_ENABLED_IN_PROVIDER: <p>Please enable Unlock in your web3 Provider</p>,
  NON_DEPLOYED_CONTRACT: (
    <p>Unlock has not been deployed on the current network.</p>
  ),
}

/**
 *
 * @param {*} error. The error can either be a pre-defined error (from errors.js)
 * or an unknown string.
 * If we have a mapping we use the mapping. Otherwise, we wrap
 */
const ErrorMessage = error => {
  if (defaultMessages[error]) {
    return defaultMessages[error]
  }
  return genericError(error)
}

export default ErrorMessage
