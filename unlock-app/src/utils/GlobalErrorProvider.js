/* eslint-disable react/no-unused-state */
// eslint does not recognize that the state is used directly in the context consumer
// and destructuring would just force unnecessary re-renders

import { connect } from 'react-redux'
import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'

import configure from '../config'
import UnlockPropTypes from '../propTypes'
import { ETHEREUM_NETWORKS_NAMES } from '../constants'

export const GlobalErrorContext = createContext()

export function mapStateToProps({ router, network, account }) {
  return {
    router,
    network,
    account,
  }
}

const config = configure()

export class GlobalErrorProvider extends Component {
  static propTypes = {
    network: UnlockPropTypes.network.isRequired,
    account: UnlockPropTypes.account.isRequired,
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
    const { router, network, account } = this.props
    if (config.isServer) {
      return this.setState(state => {
        if (state.error) {
          return { error: false, errorMetadata: {} }
        }
        return null // don't modify errors state unless we have an error condition to clear
      })
    }

    // Ensuring that we have at least 1 provider
    if (Object.keys(config.providers).length === 0) {
      return this.setState(state => {
        if (state.error === 'MISSING_PROVIDER') return null
        return { error: 'MISSING_PROVIDER', errorMetadata: {} }
      }) // TODO: put in constants
    }

    // Ensuring that the provider is using the right network!
    if (
      router.route !== '/provider' &&
      config.isRequiredNetwork &&
      !config.isRequiredNetwork(network.name)
    ) {
      return this.setState(state => {
        if (
          state.error === 'WRONG_NETWORK' &&
          state.currentNetwork === ETHEREUM_NETWORKS_NAMES[network.name][0]
        ) {
          return null
        }
        return {
          error: 'WRONG_NETWORK', // TODO: put this in constants
          errorMetadata: {
            currentNetwork: ETHEREUM_NETWORKS_NAMES[network.name][0],
            requiredNetwork: config.requiredNetwork,
          },
        }
      })
    }

    // Ensuring that an account is defined
    if (!account) {
      return this.setState({
        error: 'NO_USER_ACCOUNT',
        errorMetadata: {},
      })
    }

    this.setState(state => {
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
