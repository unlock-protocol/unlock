import React from 'react'
import { connect } from 'react-redux'
import configure from '../config'
import {
  WrongNetwork,
  MissingProvider,
  DefaultError,
} from '../components/creator/FatalError'
import SuspendedRender from '../components/helpers/SuspendedRender'
import { ETHEREUM_NETWORKS_NAMES } from '../constants'

/**
 * Function which creates higher order component with the config
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

const config = configure()
const ConfigContext = React.createContext(config)

/**
 * This creates an HOC from a component and injects the configuration.
 * It also triggers errors if constraints are not respected.
 * @param {*} Component
 */
export default function withConfig(Component) {
  function componentWithConfig(props) {
    const { router, network, account } = props
    if (router && !Component.skipConstraints) {
      if (!config.isServer) {
        // Ensuring that we have at least a provider
        if (Object.keys(config.providers).length === 0) {
          return <MissingProvider />
        }

        // Ensuring that the provider is using the right network!
        if (
          router.route !== '/provider' &&
          config.isRequiredNetwork &&
          !config.isRequiredNetwork(network.name)
        ) {
          return (
            <WrongNetwork
              currentNetwork={ETHEREUM_NETWORKS_NAMES[network.name][0]}
              requiredNetwork={config.requiredNetwork}
            />
          )
        }

        // Ensuring that an account is defined
        if (!account) {
          return (
            <SuspendedRender>
              <DefaultError title="User account not initialized">
                <p>
                  In order to display your Unlock dashboard, you need to connect
                  a crypto-wallet to your browser.
                </p>
              </DefaultError>
            </SuspendedRender>
          )
        }
      }
    }

    return (
      <ConfigContext.Consumer>
        {config => <Component {...props} config={config} />}
      </ConfigContext.Consumer>
    )
  }

  function mapStateToProps(state) {
    return {
      network: state.network,
      account: state.account,
    }
  }

  componentWithConfig.getInitialProps = async context => {
    return {
      ...(Component.getInitialProps
        ? await Component.getInitialProps(context)
        : {}),
    }
  }

  return connect(mapStateToProps)(componentWithConfig)
}
