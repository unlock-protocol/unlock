import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { Route, Switch } from 'react-router'

import LockMaker from './creator/LockMaker'
import Dashboard from './creator/Dashboard'
import Lock from './consumer/Lock'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import About from './pages/About'
import Provider from './Web3Provider'
import { withConfig } from '../utils/withConfig'
import { connect } from 'react-redux'
import { WrongNetwork, MissingProvider } from './creator/FatalError'
import { ETHEREUM_NETWORKS_NAMES } from '../constants'

let UnlockRoute = ({ component: Component, layout: Layout, ...rest }) => (
  <Route {...rest} render={props => (
    <Layout>
      <Component {...props} />
    </Layout>
  )} />
)
UnlockRoute.propTypes = {
  component: UnlockPropTypes.component,
  layout: UnlockPropTypes.layout,
}

export function Unlock({ network, config, path }) {

  // Ensuring that we have at least a provider
  if (Object.keys(config.providers).length === 0 ) {
    return (<MissingProvider />)
  }

  // Ensuring that the provider is using the right network!
  if (path !== '/provider' && config.isRequiredNetwork && !config.isRequiredNetwork(network.name)) {
    return (<WrongNetwork currentNetwork={ETHEREUM_NETWORKS_NAMES[network.name][0]} requiredNetwork={config.requiredNetwork} />)
  }

  return (
    <Switch>
      <Route path="/provider" component={Provider} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/creator" component={LockMaker} />
      <Route path="/lock/:lockAddress" component={Lock} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/about" component={About} />
      <Route path="*" component={Home} />
    </Switch>
  )
}

Unlock.propTypes = {
  config: UnlockPropTypes.configuration,
  network: UnlockPropTypes.network,
  path: PropTypes.string,
}

const mapStateToProps = state => {
  return {
    network: state.network,
    path: state.router && state.router.location && state.router.location.pathname,
  }
}

export default withConfig(connect(mapStateToProps)(Unlock))
