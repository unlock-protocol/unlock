import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'
import { pageTitle } from '../constants'
import withConfig from '../utils/withConfig'
import LogTransactions from '../components/creator/CreatorLog'

export const Log = ({ account, network, transactionFeed }) => {
  return (
    <GlobalErrorConsumer>
      <Layout title="Creator Log">
        <Head>
          <title>{pageTitle('Log')}</title>
        </Head>
        <BrowserOnly>
          <CreatorAccount network={network} account={account} />
          <LogTransactions transactionFeed={transactionFeed} />
        </BrowserOnly>
      </Layout>
    </GlobalErrorConsumer>
  )
}

Log.displayName = 'Log'

Log.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  network: UnlockPropTypes.network.isRequired,
  transactionFeed: PropTypes.arrayOf(UnlockPropTypes.transaction).isRequired,
}

export const humanize = type => {
  if (!type) return ''
  let parts = type.split('_')
  return parts.map(part => part[0] + part.slice(1).toLowerCase()).join(' ')
}

export const mapStateToProps = (
  { account, network, transactions },
  { config: { chainExplorerUrlBuilders } }
) => {
  const transactionFeed = Object.values(transactions).sort(
    (a, b) => b.blockNumber - a.blockNumber
  )

  transactionFeed.forEach((tx, i) => {
    transactionFeed[i].href =
      chainExplorerUrlBuilders.etherScan(tx.lock) || undefined
    transactionFeed[i].readableName = humanize(tx.type)
  })

  return {
    account,
    network,
    transactionFeed,
  }
}

export default withConfig(connect(mapStateToProps)(Log))
