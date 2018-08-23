import React from 'react'
import {withConfig} from '../../utils/withConfig'
import UnlockPropTypes from '../../propTypes'
import { connect } from 'react-redux'

export class NetworkBadge extends React.Component {
  constructor(props) {
    super(props)
    let config = props.config
    if (config.defaultNetwork && config.networks[config.defaultNetwork]) {
      this.networkName = config.networks[config.defaultNetwork].name
      this.networkClassName = config.defaultNetwork
    } else {
      this.networkName = 'Unknown'
      this.networkClassName = ''
    }
  }

  render() {
    return (
        <div id="network" className={this.networkClassName}>{this.networkName}</div>
    )
  }
}

NetworkBadge.propTypes = {
  config: UnlockPropTypes.configuration,
  network: UnlockPropTypes.network,
}

export default withConfig(NetworkBadge)
