import { connect } from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { setError } from '../../actions/error'
import Buttons from './buttons/layout'
import ErrorMessage from '../helpers/ErrorMessage'

export const Error = ({ error, close }) => {
  if (!error) {
    return null
  }

  let content = ErrorMessage(error)

  return (
    <Wrapper>
      {content}
      <Buttons.Close as="button" onClick={close} size="16px">
        X
      </Buttons.Close>
    </Wrapper>
  )
}

const mapStateToProps = ({ errors }) => ({
  // note: this is only showing the latest error. Soon we will rework
  // the UI to support displaying multiple errors
  error: errors.length ? errors[errors.length - 1] : null,
})

const mapDispatchToProps = dispatch => ({
  close: () => {
    dispatch(setError())
  },
})

Error.propTypes = {
  error: PropTypes.node,
  close: PropTypes.func.isRequired,
}

Error.defaultProps = {
  error: null,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Error)

const Wrapper = styled.section`
  grid-template-columns: 1fr 20px;
  display: grid;
  border: 1px solid var(--lightgrey);
  border-radius: 4px;
  font-size: 16px;
  justify-items: center;
  justify-content: center;
  align-items: center;
  padding-right: 8px;
  grid-gap: 8px;
  a {
    color: var(--red);
  }
`
