import { connect } from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { setError } from '../../actions/error'
import Buttons from './buttons/layout'

export const Error = ({ children, error, close }) => {
  const content = children || error
  if (!content) {
    return null
  }
  return (
    <Wrapper>
      {content}
      <Buttons.Close as="button" onClick={close} size="16px">
        X
      </Buttons.Close>
    </Wrapper>
  )
}

const mapStateToProps = ({ error }) => ({
  error,
})

const mapDispatchToProps = dispatch => ({
  close: () => {
    dispatch(setError(null))
  },
})

Error.propTypes = {
  children: PropTypes.node,
  error: PropTypes.node,
  close: PropTypes.func.isRequired,
}

Error.defaultProps = {
  children: null,
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
