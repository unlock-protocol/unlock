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

  FORM_LOCK_NAME_MISSING: (
    <p>Please provide a name for the lock you are creating</p>
  ),
  FORM_EXPIRATION_DURATION_INVALID: (
    <p>Expiration must be a positive whole number</p>
  ),
  FORM_MAX_KEYS_INVALID: (
    <p>Maximum keys allowed must be a positive whole number, or infinite</p>
  ),
  FORM_KEY_PRICE_INVALID: <p>Key price must be a positive number</p>,
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
