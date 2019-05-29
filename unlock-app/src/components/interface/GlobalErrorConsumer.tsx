import React from 'react'
import { connect } from 'react-redux'
import Layout from './Layout'
import { mapErrorToComponent } from '../creator/FatalError'
/* eslint-disable */
import { UnlockError, isFatalError, FatalError } from '../../utils/Error'
/* eslint-disable */

/**
 * The GlobalErrorConsumer should be renamed, but its job is simply to "intercept" any fatal error
 * and prevent the UI from displaying anything else.
 */
interface Props {
  children: JSX.Element | JSX.Element[]
  error?: FatalError
}
export function GlobalErrorConsumer({ children, error }: Props) {
  // the error object in this case is coming from the redux store and has a structure of {name, data}
  if (error) {
    const Error = mapErrorToComponent(error)
    return <Layout title="">{Error}</Layout>
  }
  return <React.Fragment>{children}</React.Fragment>
}

/**
 * Will pass the first fatal error as props.
 * @param {*} state
 */
interface State {
  errors: UnlockError[]
}
export const mapStateToProps = (state: State) => {
  if (!state.errors) {
    return {}
  }
  const error = state.errors.find(isFatalError)
  return {
    error: error,
  }
}

export default connect(mapStateToProps)(GlobalErrorConsumer)
