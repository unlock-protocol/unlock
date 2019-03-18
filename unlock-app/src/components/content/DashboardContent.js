import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import Layout from '../interface/Layout'
import CreatorAccount from '../creator/CreatorAccount'
import CreatorLocks from '../creator/CreatorLocks'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import BrowserOnly from '../helpers/BrowserOnly'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { pageTitle } from '../../constants'

export const DashboardContent = ({ account, network, lockFeed }) => {
  return (
    <GlobalErrorConsumer>
      <Layout title="Creator Dashboard">
        <Head>
          <title>{pageTitle('Dashboard')}</title>
        </Head>
        {account && (
          <BrowserOnly>
            <CreatorAccount network={network} account={account} />
            <CreatorLocks lockFeed={lockFeed} />
            <DeveloperOverlay />
          </BrowserOnly>
        )}
      </Layout>
    </GlobalErrorConsumer>
  )
}

DashboardContent.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network.isRequired,
  lockFeed: PropTypes.arrayOf(UnlockPropTypes.lock),
}

DashboardContent.defaultProps = {
  lockFeed: [],
  account: null,
}

export const mapStateToProps = state => {
  // We want to display newer locks first, so sort the locks by blockNumber in descending order
  const locksComparator = (a, b) => {
    // Newly created locks may not have a transaction associated just yet
    // -- those always go right to the top
    if (!state.transactions[a.transaction]) {
      return -1
    }
    if (!state.transactions[b.transaction]) {
      return 1
    }
    return (
      state.transactions[b.transaction].blockNumber -
      state.transactions[a.transaction].blockNumber
    )
  }
  const lockFeed = Object.values(state.locks).sort(locksComparator)
  return {
    account: state.account,
    network: state.network,
    lockFeed,
  }
}

export default connect(mapStateToProps)(DashboardContent)
