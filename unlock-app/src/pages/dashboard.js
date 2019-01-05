import React from 'react'
import { connect } from 'react-redux'
import NoSSR from 'react-no-ssr'
import Head from 'next/head'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import CreatorLocks from '../components/creator/CreatorLocks'
import DeveloperOverlay from '../components/developer/DeveloperOverlay'
import withConfig from '../utils/withConfig'
import { pageTitle } from '../constants'

export const Dashboard = ({ account, network, locks }) => {
  return (
    <Layout title="Creator Dashboard">
      <Head>
        <title>{pageTitle('Dashboard')}</title>
      </Head>
      <NoSSR>
        <CreatorAccount network={network} account={account} />
        <CreatorLocks locks={locks} />
        <DeveloperOverlay />
      </NoSSR>
    </Layout>
  )
}

Dashboard.displayName = 'Dashboard'

Dashboard.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  network: UnlockPropTypes.network.isRequired,
  locks: UnlockPropTypes.locks,
}

Dashboard.defaultProps = {
  locks: {},
}

const mapStateToProps = state => {
  return {
    account: state.account,
    network: state.network,
    locks: state.locks,
  }
}

export default withConfig(connect(mapStateToProps)(Dashboard))
