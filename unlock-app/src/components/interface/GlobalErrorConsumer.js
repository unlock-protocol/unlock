import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { GlobalErrorContext } from '../../utils/GlobalErrorProvider'
import Layout from './Layout'
import { mapErrorToComponent } from '../creator/FatalError'

// DEPRECATED we should not use the Context to detect errors
const Consumer = GlobalErrorContext.Consumer

// TODO: move that logic back to <GlobalErrorConsumer> once the Context logic is gone
export const displayError = (error, errorMetadata, children) => {
  if (error) {
    const Error = mapErrorToComponent(error, errorMetadata)
    return <Layout title="">{Error}</Layout>
  }
  return <React.Fragment>{children}</React.Fragment>
}

/**
 * The GlobalErrorConsumer should be renamed, but its job is simply to "intercept" any fatal error
 * and prevent the UI from displaying anything else.
 */
export function GlobalErrorConsumer({ displayError, children, error }) {
  if (error) {
    return displayError(error, {}, children)
  }
  return (
    <Consumer>
      {({ error, errorMetadata }) => {
        return displayError(error, errorMetadata, children)
      }}
    </Consumer>
  )
}

GlobalErrorConsumer.propTypes = {
  children: PropTypes.node.isRequired,
  displayError: PropTypes.func,
  error: PropTypes.string,
}

GlobalErrorConsumer.defaultProps = {
  displayError,
  error: null,
}

/**
 * Will pass the first fatal error as props.
 * @param {*} state
 */
export const mapStateToProps = state => {
  if (!state.errors) {
    return {}
  }
  const error = state.errors.find(error => error.startsWith('FATAL_'))
  return {
    error: error,
  }
}

export default connect(mapStateToProps)(GlobalErrorConsumer)
