import React from 'react'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'

/**
 * Pair of network name and 'class' (dev, test, staging, main)
 * Taken from https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
 */
const NETWORKS_NAMES = {
  0: ['Olympic', 'main'],
  1: ['Mainnet', 'main'],
  2: ['Morden', 'staging'],
  3: ['Ropsten', 'staging'],
  4: ['Rinkeby', 'staging'],
}

export function NetworkBadge({network}) {

  let networkName = 'Unknown'
  let networkClassName = 'dev'

  if (network && network.name && NETWORKS_NAMES[network.name]) {
    [ networkName, networkClassName ] = NETWORKS_NAMES[network.name]
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
