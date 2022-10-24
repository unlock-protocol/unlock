import React from 'react'

/**
 * Once we do localization we can map error names to different messages based on
 * the user's language
 */

const genericError = (message) => (
  <p>
    There was an error ({message}). Please retry and report if it happens again.
  </p>
)

const defaultMessages = {
  MISSING_PROVIDER: <p>You need a web3 provider to use Unlock.</p>,
  NOT_ENABLED_IN_PROVIDER: <p>Please enable Unlock in your web3 Provider</p>,
  FATAL_NON_DEPLOYED_CONTRACT: (
    <p>Unlock has not been deployed on the current network.</p>
  ),

  FAILED_TO_CREATE_LOCK: <p>Your lock could not be created</p>,
  FAILED_TO_PURCHASE_KEY: <p>Your key could not be purchased</p>,
  FAILED_TO_UPDATE_KEY_PRICE: <p>Your lock price could not be updated</p>,
  FAILED_TO_WITHDRAW_FROM_LOCK: (
    <p>Funds from your lock could not be withdrawn</p>
  ),

  FATAL_NO_USER_ACCOUNT: (
    <p>You need an Ethereum wallet to perform this action</p>
  ),
}

/**
 *
 * @param {*} error. The error can either be a pre-defined error (from errors.js)
 * or an unknown string.
 * If we have a mapping we use the mapping. Otherwise, we wrap
 */
const ErrorMessage = (error) => {
  if (defaultMessages[error]) {
    return defaultMessages[error]
  }
  return genericError(error)
}

export default ErrorMessage
