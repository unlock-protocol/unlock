import { connect } from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { resetError } from '../../actions/error'
import Buttons from './buttons/layout'

export const Error = ({ children, error, close, dev, title }) => {
  const content = children || (error && error.message)
  const context = dev && error && error.context
  if (!content) {
    return null
  }
  return (
    <Wrapper>
      <ErrorInfo>
        <p>{content}</p>
        {context ? <p className="context">{context}</p> : null}
      </ErrorInfo>
      <Buttons.Close
        as="button"
        size="16px"
        onClick={() => close(error)}
        title={title || `dismiss "${content}" error`}
      >
        X
      </Buttons.Close>
    </Wrapper>
  )
}

export const Errors = ({ errors, close, ...props }) => {
  return (
    <>
      {errors.map((error, i) => (
        <Error
          tabIndex={i}
          key={error.message}
          error={error}
          close={close}
          {...props}
        />
      ))}
      {errors.length ? (
        <Error close={close} title="Close All">
          Close all
        </Error>
      ) : null}
    </>
  )
}

const mapStateToProps = ({ errors }) => ({
  errors,
})

const mapDispatchToProps = dispatch => ({
  close: error => {
    dispatch(resetError(error))
  },
})

Errors.propTypes = {
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
      context: PropTypes.string,
    })
  ),
  dev: PropTypes.bool,
  close: PropTypes.func.isRequired,
}

Errors.defaultProps = {
  errors: [],
  dev: process.env.NODE_ENV !== 'production',
}

Error.propTypes = {
  children: PropTypes.node,
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    context: PropTypes.string,
  }),
  dev: PropTypes.bool,
  close: PropTypes.func.isRequired,
  title: PropTypes.string,
}

Error.defaultProps = {
  children: null,
  error: null,
  dev: process.env.NODE_ENV !== 'production',
  title: '',
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Errors)

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
