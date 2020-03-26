import React from 'react'
import styled from 'styled-components'
import { UnlockError } from '../../../utils/Error'

interface CheckoutErrorsProps {
  errors: UnlockError[]
  resetError: (error: UnlockError) => void
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
            {error.message}
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
