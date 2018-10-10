import UnlockPropTypes from '../../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import Layout from '../interface/Layout'
import CreatorAccount from './CreatorAccount'
import CreatorLocks from './CreatorLocks'

export const Dashboard = ({account, network, transactions, locks, showForm}) => {
  if (!account) {
    return null //loading
  }

  return (
    <Layout title="Creator Dashboard">
      <CreatorAccount network={network} account={account} />
      <CreatorLocks transactions={transactions} locks={locks} showForm={showForm} />
    </Layout>
  )
}

Dashboard.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network,
  transactions: UnlockPropTypes.transactions,
  locks: UnlockPropTypes.locks,
  showForm: UnlockPropTypes.showDashboardForm,
}

const mapStateToProps = state => {
  return {
    account: state.network.account, // TODO change account to base level
    network: state.network,
    transactions: state.transactions,
    locks: state.locks,
    showForm: state.showDashboardForm,
  }
}

export default connect(mapStateToProps)(Dashboard)
