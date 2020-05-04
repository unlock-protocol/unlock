import React from 'react'
import styled from 'styled-components'
import { UnlockError } from '../../../utils/Error'
import { ETHEREUM_NETWORKS_NAMES } from '../../../constants'

interface CheckoutErrorsProps {
  errors: UnlockError[]
  resetError: (error: UnlockError) => void
}

const fatalErrorMessages: { [key: string]: string } = {
  FATAL_NON_DEPLOYED_CONTRACT:
    'The Unlock contract has not been deployed at the configured address.',
  FATAL_NOT_ENABLED_IN_PROVIDER:
    'You did not approve Unlock in your web3 wallet.',
}

export const genericError =
  'This is a generic error because something just broke but we’re not sure what.'

const getMessage = (error: UnlockError) => {
  if (error.message === 'FATAL_WRONG_NETWORK') {
    const { currentNetwork, requiredNetworkId } = (error as any).data
    const requiredNetwork = ETHEREUM_NETWORKS_NAMES[requiredNetworkId][0]
    return `You're currently on the ${currentNetwork} network, but you need to be on the ${requiredNetwork} network for the app to function.`
  }

  if (error.level === 'Fatal') {
    return fatalErrorMessages[error.message] || error.message || genericError
  }

  return error.message
}

export const CheckoutErrors = ({ errors, resetError }: CheckoutErrorsProps) => {
  const components = {
    Fatal: FatalError,
    Warning: WarningError,
    Diagnostic: DiagnosticError,
  }
  return (
    <>
      {errors.map(error => {
        const Component = components[error.level]
        const onClick = () => resetError(error)
        return (
          <Component key={error.message} onClick={onClick}>
            {getMessage(error)}
          </Component>
        )
      })}
    </>
  )
}

const BaseError = styled.div`
  width: 100%;
  border-radius: 4px;
  padding: 12px 8px;
  margin-bottom: 8px;
  cursor: pointer;
`

const FatalError = styled(BaseError)`
  border: thin var(--sharpred) solid;
  background-color: #f24c1533;
`

const WarningError = styled(BaseError)`
  border: thin var(--yellow) solid;
  background-color: #f6c61b33;
`

const DiagnosticError = styled(BaseError)`
  border: thin var(--darkgrey) solid;
  background: #a6a6a633;
`
