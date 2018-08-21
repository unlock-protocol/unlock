import React from 'react'
import { withConfig } from '../../utils/withConfig'

export class MainLayout extends React.Component {
  constructor(props) {
    super(props)
    this.children = props.children
    if (props.config.defaultNetwork && props.config.networks[props.config.defaultNetwork]) {
      this.networkName = props.config.networks[props.config.defaultNetwork].name
      this.networkClassName = props.config.defaultNetwork
    } else {
      this.networkName = 'Unknown'
      this.networkClassName = ''
    }
  }

  render() {
    return (
    <div className="layout-main">
      <div id="network" className={this.networkClassName}>{this.networkName}</div>
      {this.children}
    </div>
    )
  }
}

export default withConfig(MainLayout)
