import React from 'react'
import configure from '../config'
import { WrongNetwork, MissingProvider } from '../components/creator/FatalError'
import { ETHEREUM_NETWORKS_NAMES } from '../constants'
import { connect } from 'react-redux'

/**
 * Function which creates higher order component with the config
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

const isServer = typeof window === 'undefined'
const config = configure(global)
const ConfigContext = React.createContext(config)

// This function takes a component...
export function withConfig(Component) {
  // ...and returns another component...
  function componentWithConfig(props) {
    // ... and renders the wrapped component with the context config!
    // Notice that we pass through any additional props as well

    const { store: reduxStore, router } = props

    if (!isServer) {
      // Ensuring that we have at least a provider
      if (Object.keys(config.providers).length === 0) {
        return (<MissingProvider />)
      }

      // Ensuring that the provider is using the right network!
      if (router.route !== '/provider' && config.isRequiredNetwork && !config.isRequiredNetwork(reduxStore.getState().network.name)) {
        return (<WrongNetwork currentNetwork={ETHEREUM_NETWORKS_NAMES[reduxStore.getState().network.name][0]} requiredNetwork={config.requiredNetwork} />)
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
      account: state.network.account, // TODO change account to base level
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
