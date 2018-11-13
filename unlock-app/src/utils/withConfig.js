import React from 'react'
import { connect } from 'react-redux'
import configure from '../config'
import { WrongNetwork, MissingProvider } from '../components/creator/FatalError'
import { ETHEREUM_NETWORKS_NAMES } from '../constants'

/**
 * Function which creates higher order component with the config
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

const config = configure(global)
const ConfigContext = React.createContext(config)

/**
 * This creates an HOC from a component and injects the configuration.
 * It also triggers errors if constraints are not respected.
 * @param {*} Component
 */
export default function withConfig(Component) {

  function componentWithConfig(props) {

    const { store: reduxStore, router } = props

    if (router && !Component.skipConstraints) {
      if (!config.isServer) {
        // Ensuring that we have at least a provider
        if (Object.keys(config.providers).length === 0) {
          return (<MissingProvider />)
        }

        // Ensuring that the provider is using the right network!
        if (router.route !== '/provider' && config.isRequiredNetwork && !config.isRequiredNetwork(reduxStore.getState().network.name)) {
          return (<WrongNetwork currentNetwork={ETHEREUM_NETWORKS_NAMES[reduxStore.getState().network.name][0]} requiredNetwork={config.requiredNetwork} />)
        }
      }

    }

    return (
      <ConfigContext.Consumer>
        {config => <Component {...props} config={config} />}
      </ConfigContext.Consumer>
    )
  }

  function mapStateToProps (state) {
    return {
      network: state.network,
    }
  }

  componentWithConfig.getInitialProps = async context => {
    return {
      ...(Component.getInitialProps ? await Component.getInitialProps(context) : {}),
    }
  }

  return connect(mapStateToProps)(componentWithConfig)
}
