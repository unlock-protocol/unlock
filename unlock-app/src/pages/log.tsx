import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'
import { pageTitle } from '../constants'
import withConfig from '../utils/withConfig'
import LogTransactions from '../components/creator/CreatorLog'
import * as UnlockTypes from '../unlock'

interface Props {
  account: UnlockTypes.Account
  network: UnlockTypes.Network
  transactionFeed: UnlockTypes.Transaction[]
  transactionMetadata: UnlockTypes.TransactionMetadata
}

export const Log = (props: Props) => {
  const { account, network, transactionFeed, transactionMetadata } = props
  return (
    <GlobalErrorConsumer>
      <Layout title="Creator Log">
        <Head>
          <title>{pageTitle('Log')}</title>
        </Head>
        <BrowserOnly>
          <CreatorAccount network={network} account={account} />
          <LogTransactions transactionFeed={transactionFeed} transactionMetadata={transactionMetadata} />
        </BrowserOnly>
      </Layout>
    </GlobalErrorConsumer>
  )
}

Log.displayName = 'Log'

export const humanize = (type: string) => {
  if (!type) return ''
  let parts = type.split('_')
  return parts.map(part => part[0] + part.slice(1).toLowerCase()).join(' ')
}

export const mapStateToProps = (
  { account, network, transactions }: { account: UnlockTypes.Account, network: UnlockTypes.Network, transactions: UnlockTypes.Transactions },
  { config: { chainExplorerUrlBuilders } } : { config: { chainExplorerUrlBuilders: UnlockTypes.ChainExplorerURLBuilders } }
) => {
  const transactionFeed = Object.values(transactions).sort(
    (a, b) => b.blockNumber - a.blockNumber
  )

  const transactionMetadata: UnlockTypes.TransactionMetadata = {}

  transactionFeed.forEach((tx) => {
    transactionMetadata[tx.hash] = {
      href: chainExplorerUrlBuilders.etherScan(tx.lock),
      readableName: humanize(tx.type)
    }
  })

  return {
    account,
    network,
    transactionFeed,
    transactionMetadata,
  }
}

export default withConfig(connect(mapStateToProps)(Log))
