import { connect } from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { resetError } from '../../actions/error'
import Buttons from './buttons/layout'
import ErrorMessage from '../helpers/ErrorMessage'

export const Errors = ({ errors, close }) => {
  const content = errors.map(error => (
    <Error key={error}>{ErrorMessage(error)}</Error>
  ))
  if (!content || !content.length) {
    return null
  }

  return (
    <Wrapper>
      {content}
      <SecondColumn cols={errors.length ? errors.length : 1}>
        <Buttons.Close as="button" onClick={close} size="16px">
          X
        </Buttons.Close>
      </SecondColumn>
    </Wrapper>
  )
}

export const mapStateToProps = ({ errors }) => ({ errors })

const mapDispatchToProps = dispatch => ({
  close: () => {
    dispatch(resetError())
  },
})

Errors.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string),
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
  grid-gap: 8px;
  a {
    color: var(--red);
  }
`

const Error = styled.div`
  grid-column: 1;
  color: var(--red);
`

const SecondColumn = styled.div`
  display: grid;
  grid-column: 2;
  grid-row: 1;
`
