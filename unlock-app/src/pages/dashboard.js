import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import CreatorLocks from '../components/creator/CreatorLocks'
import DeveloperOverlay from '../components/developer/DeveloperOverlay'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'
import { pageTitle } from '../constants'

export const Dashboard = ({ account, network, locks }) => {
  return (
    <GlobalErrorProvider>
      <GlobalErrorConsumer>
        <Layout title="Creator Dashboard">
          <Head>
            <title>{pageTitle('Dashboard')}</title>
          </Head>
          <BrowserOnly>
            <CreatorAccount network={network} account={account} />
            <CreatorLocks locks={locks} />
            <DeveloperOverlay />
          </BrowserOnly>
        </Layout>
      </GlobalErrorConsumer>
    </GlobalErrorProvider>
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

export default connect(mapStateToProps)(Dashboard)
