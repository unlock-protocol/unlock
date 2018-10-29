import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import NoSSR from 'react-no-ssr'
import Head from 'next/head'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import CreatorLocks from '../components/creator/CreatorLocks'
import { withConfig } from '../utils/withConfig'
import { pageTitle } from '../constants'

export const Dashboard = ({account, network, transactions, locks}) => {
  if (!account) {
    return null //loading
  }

  return (
    <Layout title="Creator Dashboard">
      <Head>
        <title>{pageTitle('Dashboard')}</title>
      </Head>
      <NoSSR>
        <CreatorAccount network={network} account={account} />
        <CreatorLocks transactions={transactions} locks={locks} />
      </NoSSR>
    </Layout>
  )
}

Dashboard.displayName = 'Dashboard'

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

export default withConfig(connect(mapStateToProps)(Dashboard))
