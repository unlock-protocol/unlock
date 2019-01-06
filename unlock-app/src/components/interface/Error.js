import { connect } from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { setError } from '../../actions/error'
import Buttons from './buttons/layout'

export const Error = ({ children, error, close, dev }) => {
  const content = children || (error && error.message)
  if (!content) {
    return null
  }
  return (
    <Wrapper>
      <ErrorInfo>
        <p>{content}</p>
        {dev && error && error.context ? (
          <p className="context">{error.context}</p>
        ) : (
          ''
        )}
      </ErrorInfo>
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
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    context: PropTypes.string,
  }),
  dev: PropTypes.bool,
  close: PropTypes.func.isRequired,
}

Error.defaultProps = {
  children: null,
  error: null,
  dev: process.env.NODE_ENV !== 'production',
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Error)

const ErrorInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  & p.context {
    color: red;
    font-style: italic;
    font-size: 14px;
    margin-top: 0;
  }

  & p.context::before {
    content: 'Context:';
    padding-right: 10px;
  }
`

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
