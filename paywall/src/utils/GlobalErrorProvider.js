/* eslint-disable react/no-unused-state */
// eslint does not recognize that the state is used directly in the context consumer
// and destructuring would just force unnecessary re-renders

import { connect } from 'react-redux'
import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'

import configure from '../config'
import UnlockPropTypes from '../propTypes'
import { ETHEREUM_NETWORKS_NAMES } from '../constants'
import {
  FATAL_MISSING_PROVIDER,
  FATAL_WRONG_NETWORK,
  FATAL_NO_USER_ACCOUNT,
} from '../errors'

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

  detectMissingProvider(state) {
    // Ensuring that we have at least 1 provider
    if (Object.keys(config.providers).length === 0) {
      if (state.error === FATAL_MISSING_PROVIDER) return null
      return { error: FATAL_MISSING_PROVIDER, errorMetadata: {} }
    }
  }

  detectWrongNetwork(state) {
    const { router, network } = this.props
    // Ensuring that the provider is using the right network!
    if (
      router.route !== '/provider' &&
      config.isRequiredNetwork &&
      !config.isRequiredNetwork(network.name)
    ) {
      const currentNetwork = ETHEREUM_NETWORKS_NAMES[network.name]
        ? ETHEREUM_NETWORKS_NAMES[network.name][0]
        : 'Unknown Network'
      if (
        state.error === FATAL_WRONG_NETWORK &&
        state.errorMetadata.currentNetwork === currentNetwork
      ) {
        return null
      }
      return {
        error: FATAL_WRONG_NETWORK,
        errorMetadata: {
          currentNetwork: currentNetwork,
          requiredNetworkId: config.requiredNetworkId,
        },
      }
    }
  }

  detectNoAccount(state) {
    const { account } = this.props
    // Ensuring that an account is defined
    if (!account) {
      if (state.error === FATAL_NO_USER_ACCOUNT) return null
      return {
        error: FATAL_NO_USER_ACCOUNT,
        errorMetadata: {},
      }
    }
  }

  detectErrors() {
    return this.setState(state => {
      if (config.isServer) {
        if (state.error) {
          return { error: false, errorMetadata: {} }
        }
        return null // don't modify errors state unless we have an error condition to clear
      }

      // Ensuring that we have at least 1 provider
      const testProvider = this.detectMissingProvider(state)
      if (testProvider !== undefined) return testProvider

      // Ensuring that the provider is using the right network!
      const testNetwork = this.detectWrongNetwork(state)
      if (testNetwork !== undefined) return testNetwork

      // Ensuring that an account is defined
      const testAccount = this.detectNoAccount(state)
      if (testAccount !== undefined) return testAccount

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

GlobalErrorProvider.propTypes = {
  network: UnlockPropTypes.network.isRequired,
  // note: account can be empty if we are not logged in. It's not required, but we don't want a default value
  // so we need to disable eslint to prevent a warning
  // eslint-disable-next-line
  account: UnlockPropTypes.account,
  router: PropTypes.shape({
    route: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
      hash: PropTypes.string.isRequired,
    }),
    action: PropTypes.string,
  }).isRequired,
  children: PropTypes.node.isRequired,
}

export default connect(mapStateToProps)(GlobalErrorProvider)
