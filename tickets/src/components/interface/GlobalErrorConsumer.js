import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Layout from './Layout'
import { mapErrorToComponent } from '../creator/FatalError'
import UnlockPropTypes from '../../propTypes'

// TODO: move that logic back to <GlobalErrorConsumer> once the Context logic is gone
export const displayError = (error, errorMetadata, children) => {
  if (error) {
    const Error = mapErrorToComponent(error, errorMetadata)
    return <Layout title="">{Error}</Layout>
  }
  return <>{children}</>
}

/**
 * The GlobalErrorConsumer should be renamed, but its job is simply to "intercept" any fatal error
 * and prevent the UI from displaying anything else.
 */
export function GlobalErrorConsumer({ displayError, children, error }) {
  // the error object in this case is coming from the redux store and has a structure of {name, data}
  if (error) {
    return displayError(error.name, error.data, children)
  }
  return <>{children}</>
}

GlobalErrorConsumer.propTypes = {
  children: PropTypes.node.isRequired,
  displayError: PropTypes.func,
  error: UnlockPropTypes.error,
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
  const error = state.errors.find(error => error.name.startsWith('FATAL_'))
  return {
    error: error,
  }
}

export default connect(mapStateToProps)(GlobalErrorConsumer)
