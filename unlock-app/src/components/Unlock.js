import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'
import { ETHEREUM_NETWORKS_NAMES } from '../constants'

import React from 'react'
import { Route, Switch } from 'react-router'

import LockMaker from './creator/LockMaker'
import Lock from './consumer/Lock'
import Home from './Home'
import Provider from './Provider'
import { withConfig } from '../utils/withConfig'
import { connect } from 'react-redux'

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
    return (<div>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">A Web3 provider is required</h5>
          </div>
          <div className="modal-body">
            <p>This early version of Unlock requires you to use an injected Web3 provider such as <a href="https://metamask.io/">Metamask</a>. </p>
          </div>
        </div>
      </div>
    </div>)
  }

  // Ensuring that the provider is using the right network!
  if (path !== '/provider' && config.isRequiredNetwork && !config.isRequiredNetwork(network.name)) {
    return (<div>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Wrong network</h5>
          </div>
          <div className="modal-body">
            <p>This early version of Unlock requires you to use the {config.requiredNetwork} network (you are currently connected to {ETHEREUM_NETWORKS_NAMES[network.name][0]}). Please swicth your provider to use {config.requiredNetwork}. </p>
          </div>
        </div>
      </div>
    </div>)
  }

  return (
    <Switch>
      <Route path="/provider" component={Provider} />
      <Route path="/creator" component={LockMaker} />
      <Route path="/lock/:lockAddress" component={Lock} />
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
