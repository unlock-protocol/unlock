import { connect } from 'react-redux'
import React from 'react'
import styled from 'styled-components'
import { resetError } from '../../actions/error'
import Buttons from './buttons/layout'
import ErrorMessage from '../helpers/ErrorMessage'
/* eslint-disable */
import { UnlockError, WarningError, isWarningError } from '../../utils/Error'
/* eslint-enable */

interface Props {
  errors: WarningError[]
  close: (e: WarningError) => any
}

export const Errors = ({ errors, close }: Props) => {
  const content = errors.map((error) => (
    <ErrorWrapper key={error.message}>
      <Message>{ErrorMessage(error.message)}</Message>
      <Buttons.Close as="button" onClick={() => close(error)} size="16px">
        X
      </Buttons.Close>
    </ErrorWrapper>
  ))
  if (!content || !content.length) {
    return null
  }

  return <>{content}</>
}

interface ReduxState {
  errors: UnlockError[]
}

export const mapStateToProps = ({ errors }: ReduxState) => {
  const warnings = errors.filter(isWarningError)

  return {
    errors: warnings,
  }
}

const mapDispatchToProps = (dispatch: (action: any) => any) => ({
  close: (e: WarningError) => {
    dispatch(resetError(e))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Errors)

const ErrorWrapper = styled.section`
  grid-template-columns: 1fr 20px;
  display: grid;
  border: 1px solid var(--lightgrey);
  border-radius: 4px;
  font-size: 16px;
  justify-items: center;
  justify-content: center;
  align-items: center;
  padding: 8px 16px 8px 16px;
  margin-bottom: 8px;
  grid-gap: 8px;
  a {
    color: var(--red);
  }
`

const Message = styled.div`
  grid-column: 1;
  color: var(--red);
`
