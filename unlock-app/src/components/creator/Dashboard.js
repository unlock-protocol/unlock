import UnlockPropTypes from '../../propTypes'

import React, { Component } from 'react'
import Layout from '../interface/Layout'
import CreatorAccount from './CreatorAccount'

export default class Dashboard extends Component {
  render() {
    return (
      <Layout title="Creator Dashboard">
        <CreatorAccount network={this.props.network} account={this.props.account} />
      </Layout>
    )
  }
}

Dashboard.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network,
}
