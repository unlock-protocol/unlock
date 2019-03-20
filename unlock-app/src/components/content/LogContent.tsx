import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Layout from '../interface/Layout'
import CreatorAccount from '../creator/CreatorAccount'
import CreatorLog from '../creator/CreatorLog'
import BrowserOnly from '../helpers/BrowserOnly'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { pageTitle } from '../../constants'
import withConfig from '../../utils/withConfig'
import * as UnlockTypes from '../../unlock'

interface Props {
  account: UnlockTypes.Account
  network: UnlockTypes.Network
  transactionFeed: UnlockTypes.Transaction[]
  transactionMetadataMap: UnlockTypes.TransactionMetadataMap
}

export const LogContent = (props: Props) => {
  const { account, network, transactionFeed, transactionMetadataMap } = props
  return (
    <GlobalErrorConsumer>
      <Layout title="Creator Log">
        <Head>
          <title>{pageTitle('Log')}</title>
        </Head>
        {account && (
          <BrowserOnly>
            <CreatorAccount network={network} account={account} />
            <CreatorLog
              transactionFeed={transactionFeed}
              transactionMetadata={transactionMetadataMap}
            />
          </BrowserOnly>
        )}
      </Layout>
    </GlobalErrorConsumer>
  )
}

export const readable = (type: UnlockTypes.TransactionType) => {
  let parts = type.split('_')
  return parts.map(part => part[0] + part.slice(1).toLowerCase()).join(' ')
}

export const mapStateToProps = (
  { account, network, transactions }: { account: UnlockTypes.Account,
                                        network: UnlockTypes.Network,
                                        transactions: UnlockTypes.Transactions,
  },
  { config: { chainExplorerUrlBuilders } } : { config: { chainExplorerUrlBuilders: UnlockTypes.ChainExplorerURLBuilders } }
) => {
  const transactionFeed = Object.values(transactions).sort(
    (a, b) => b.blockNumber - a.blockNumber
  )

  const transactionMetadataMap: UnlockTypes.TransactionMetadataMap = {}

  transactionFeed.forEach(tx => {
    transactionMetadataMap[tx.hash] = {
      href: chainExplorerUrlBuilders.etherScan(tx.lock),
      readableName: readable(tx.type),
    }
  })

  return {
    account,
    network,
    transactionFeed,
    transactionMetadataMap,
  }
}

export default withConfig(connect(mapStateToProps)(LogContent))
