import React from 'react'
import { connect } from 'react-redux'
import NoSSR from 'react-no-ssr'
import Head from 'next/head'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import SuspendedError from '../components/helpers/SuspendedError'
import CreatorAccount from '../components/creator/CreatorAccount'
import CreatorLocks from '../components/creator/CreatorLocks'
import withConfig from '../utils/withConfig'
import { pageTitle } from '../constants'
import { DefaultError } from '../components/creator/FatalError'

export const Dashboard = ({ account, network, locks }) => {
  if (!account) {
    return (
      <SuspendedError>
        <DefaultError title="User account not initialized">
          <p>
            In order to display your Unlock dashboard, you need to connect a
            crypto-wallet to your browser
          </p>
        </DefaultError>
      </SuspendedError>
    )
  }

  return (
    <Layout title="Creator Dashboard">
      <Head>
        <title>{pageTitle('Dashboard')}</title>
      </Head>
      <NoSSR>
        <CreatorAccount network={network} account={account} />
        <CreatorLocks locks={locks} />
      </NoSSR>
    </Layout>
  )
}

Dashboard.displayName = 'Dashboard'

Dashboard.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network.isRequired,
  locks: UnlockPropTypes.locks,
}

Dashboard.defaultProps = {
  locks: {},
  account: null,
}

const mapStateToProps = state => {
  return {
    account: state.account,
    network: state.network,
    locks: state.locks,
  }
}

export default withConfig(connect(mapStateToProps)(Dashboard))
