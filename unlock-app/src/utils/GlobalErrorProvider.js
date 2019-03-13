/* eslint-disable react/no-unused-state */
// eslint does not recognize that the state is used directly in the context consumer
// and destructuring would just force unnecessary re-renders

import { connect } from 'react-redux'
import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'

import configure from '../config'
import UnlockPropTypes from '../propTypes'

export const GlobalErrorContext = createContext()

export function mapStateToProps({ router, account }) {
  return {
    router,
    account,
  }
}

const config = configure()

export class GlobalErrorProvider extends Component {
  // TODO: consistency: we do not define propTypes like that anywhere else in the app...
  static propTypes = {
    // note: account can be empty if we are not logged in. It's not required, but we don't want a default value
    // so we need to disable eslint to prevent a warning
    // eslint-disable-next-line
    account: UnlockPropTypes.account,
    router: PropTypes.shape({
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
        search: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired,
      }),
      action: PropTypes.string,
    }).isRequired,
    children: PropTypes.node.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      error: false,
      errorMetadata: {},
    }
  }

  componentDidMount() {
    this.detectErrors()
  }

  componentDidUpdate() {
    this.detectErrors()
  }

  detectErrors() {
    return this.setState(state => {
      if (config.isServer) {
        if (state.error) {
          return { error: false, errorMetadata: {} }
        }
        return null // don't modify errors state unless we have an error condition to clear
      }

      // reset any existing errors
      if (state.error) {
        return { error: false, errorMetadata: {} }
      }
      return null // don't modify errors state unless we have an error condition to clear
    })
  }

  render() {
    const { children } = this.props
    return (
      <GlobalErrorContext.Provider value={this.state}>
        {children}
      </GlobalErrorContext.Provider>
    )
  }
}

export default connect(mapStateToProps)(GlobalErrorProvider)
