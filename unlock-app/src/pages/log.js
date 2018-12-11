import React from 'react'
import { connect } from 'react-redux'
import NoSSR from 'react-no-ssr'
import Head from 'next/head'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import CreatorLogs from '../components/creator/CreatorLogs'
import withConfig from '../utils/withConfig'
import { pageTitle } from '../constants'

export const Log = ({ account, network, transactions, locks, state }) => {
  if (!account) {
    return null //loading
  }

  return (
    <Layout title="Creator Log">
      <Head>
        <title>{pageTitle('Log')}</title>
      </Head>
      <NoSSR>
        <pre>{JSON.stringify({ state }, null, 2)}</pre>
        <CreatorAccount network={network} account={account} />
        <CreatorLogs transactions={transactions} locks={locks} />
      </NoSSR>
    </Layout>
  )
}

Log.displayName = 'Log'

Log.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  network: UnlockPropTypes.network.isRequired,
  transactions: UnlockPropTypes.transactions,
  locks: UnlockPropTypes.locks,
}

Log.defaultProps = {
  transactions: {},
  locks: {},
}

const mapStateToProps = state => {
  return {
    account: state.account,
    network: state.network,
    transactions: state.transactions,
    locks: state.locks,
    state: state,
  }
}

export default withConfig(connect(mapStateToProps)(Log))
