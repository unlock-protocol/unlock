import React from 'react'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'
import { ETHEREUM_NETWORKS_NAMES } from '../../constants'

export function NetworkBadge({network}) {

  let networkName = 'Unknown'
  let networkClassName = 'dev'

  if (network && network.name && ETHEREUM_NETWORKS_NAMES[network.name]) {
    [ networkName, networkClassName ] = ETHEREUM_NETWORKS_NAMES[network.name]
  }

  return (
    <div id="network" className={networkClassName}>{networkName}</div>
  )
}

NetworkBadge.propTypes = {
  config: UnlockPropTypes.configuration,
  network: UnlockPropTypes.network,
}

const mapStateToProps = state => {
  return {
    network: state.network,
  }
}

export default connect(mapStateToProps)(NetworkBadge)
