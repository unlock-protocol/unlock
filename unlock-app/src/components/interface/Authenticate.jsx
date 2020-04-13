import React, { useContext } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { useProvider } from '../../hooks/useProvider'
import Loading from './Loading'
import {
  WrongNetwork,
  MissingProvider,
  NotEnabledInProvider,
} from '../creator/FatalError'
import { ETHEREUM_NETWORKS_NAMES } from '../../constants'
import { ConfigContext } from '../../utils/withConfig'
import UnlockPropTypes from '../../propTypes'

import Error from '../../utils/Error'
import LogInSignUp from './LogInSignUp'

/**
 * A basic component which ensures that
 * 1. there is a provider
 * 2. an account is available
 * 3. the user is on the correct network
 *
 * If no provider is available, and if the component allows for it, we let the user login
 * If no provider is available and the component does not allow for it, we show the missing provider
 * error
 * TODO: add support for web3Modal!
 *
 * If a provider exists but no account is there, we show a message indicating to the user that
 * they need to enable wallet in their provider
 *
 * If the user is on the wrong network, we show a message indicating that the need to switch to the
 * correct network
 *
 * If everything is fine, we render the children!
 * All descendant can then access the provider from the hook (mostly to sign and/or send transactions)
 * or the account
 */

export const Authenticate = ({
  children,
  unlockUserAccount,
  account,
  network,
  config,
  provider,
  loading,
}) => {
  // Loading the provider
  if (loading) {
    return <Loading />
  }

  // No provider
  if (!provider) {
    if (!unlockUserAccount) {
      return <MissingProvider />
    }
    return <LogInSignUp login />
  }

  // No account
  if (!account) {
    // No account, but we have a provider.
    // Let's ask the user to check their wallet!
    return <NotEnabledInProvider />
  }

  // Wrong network
  if (network.name !== config.requiredNetworkId) {
    const currentNetwork = ETHEREUM_NETWORKS_NAMES[network.name]
      ? ETHEREUM_NETWORKS_NAMES[network.name][0]
      : 'Unknown Network'

    return (
      <WrongNetwork
        currentNetwork={currentNetwork}
        requiredNetworkId={config.requiredNetworkId}
      />
    )
  }

  // All good!
  return children
}

Authenticate.propTypes = {
  children: PropTypes.node.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  provider: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  unlockUserAccount: PropTypes.bool,
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network,
}

Authenticate.defaultProps = {
  unlockUserAccount: false,
  account: null,
  network: null,
  provider: null,
}

export const AuthenticateWithHooks = ({
  children,
  unlockUserAccount,
  account,
  network,
}) => {
  const config = useContext(ConfigContext)
  const { provider, loading } = useProvider()
  return (
    <Authenticate
      unlockUserAccount={unlockUserAccount}
      account={account}
      network={network}
      config={config}
      provider={provider}
      loading={loading}
    >
      {children}
    </Authenticate>
  )
}

AuthenticateWithHooks.propTypes = {
  children: PropTypes.node.isRequired,
  unlockUserAccount: PropTypes.bool,
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network,
}

AuthenticateWithHooks.defaultProps = {
  unlockUserAccount: false,
  account: null,
  network: null,
}

export const mapStateToProps = ({ account, network }) => {
  return {
    account,
    network,
  }
}

export default connect(mapStateToProps)(AuthenticateWithHooks)
