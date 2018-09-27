import UnlockPropTypes from '../../propTypes'

import React, { Component } from 'react'
import Layout from '../interface/Layout'
import CreatorAccount from './CreatorAccount'
import CreatorLocks from './CreatorLocks'
import {setTransaction} from '../../actions/transaction'
import { connect } from 'react-redux'

export class Dashboard extends Component {
  render() {
    if (!this.props.account) {
      return null //loading
    }

    return (
      <Layout title="Creator Dashboard">
        <CreatorAccount network={this.props.network} account={this.props.account} />
        <CreatorLocks transactions={this.props.transactions} locks={this.props.locks} />
      </Layout>
    )
  }
}

Dashboard.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network,
  transactions: UnlockPropTypes.transactions,
  locks: UnlockPropTypes.locks,
}

const mapStateToProps = state => {
  return {
    account: state.network.account, // TODO change account to base level
    network: state.network,
    transactions: state.transactions,
    locks: state.locks,
  }
}

export default connect(mapStateToProps)(Dashboard)
