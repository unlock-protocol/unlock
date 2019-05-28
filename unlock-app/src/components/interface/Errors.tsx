import { connect } from 'react-redux'
import React from 'react'
import styled from 'styled-components'
import { resetError } from '../../actions/error'
import Buttons from './buttons/layout'
import ErrorMessage from '../helpers/ErrorMessage'
import { Error } from '../../unlockTypes' // eslint-disable-line no-unused-vars

interface Props {
  errors: Error[]
  close: (errorName: string) => any
}

export const Errors = ({ errors, close }: Props) => {
  const content = errors.map(error => (
    <ErrorWrapper key={error.name}>
      <Message>{ErrorMessage(error.name)}</Message>
      <Buttons.Close as="button" onClick={() => close(error.name)} size="16px">
        X
      </Buttons.Close>
    </ErrorWrapper>
  ))
  if (!content || !content.length) {
    return null
  }

  return <React.Fragment>{content}</React.Fragment>
}

interface ReduxState {
  errors: Error[]
}

export const mapStateToProps = ({ errors }: ReduxState) => ({ errors })

const mapDispatchToProps = (dispatch: (action: any) => any) => ({
  close: (errorName: string) => {
    dispatch(resetError(errorName))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Errors)

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
