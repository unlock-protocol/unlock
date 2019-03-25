import { connect } from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { resetError } from '../../actions/error'
import Buttons from './buttons/layout'
import ErrorMessage from '../helpers/ErrorMessage'
import UnlockPropTypes from '../../propTypes'

export const Errors = ({ errors, close }) => {
  const content = errors.map(error => (
    <Wrapper key={error.name}>
      <Error>{ErrorMessage(error.name)}</Error>
      <Buttons.Close as="button" onClick={() => close(error.name)} size="16px">
        X
      </Buttons.Close>
    </Wrapper>
  ))
  if (!content || !content.length) {
    return null
  }

  return <React.Fragment>{content}</React.Fragment>
}

export const mapStateToProps = ({ errors }) => ({ errors })

const mapDispatchToProps = dispatch => ({
  close: error => {
    dispatch(resetError(error))
  },
})

Errors.propTypes = {
  errors: PropTypes.arrayOf(UnlockPropTypes.error),
  close: PropTypes.func.isRequired,
}

Errors.defaultProps = {
  errors: [],
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Errors)

const Wrapper = styled.section`
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

const Error = styled.div`
  grid-column: 1;
  color: var(--red);
`
