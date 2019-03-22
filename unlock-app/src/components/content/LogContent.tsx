import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import BrowserOnly from '../helpers/BrowserOnly'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import CreatorLog from '../creator/CreatorLog'
import { pageTitle } from '../../constants'
import {
  CreateLockButton,
  AccountWrapper
} from '../interface/buttons/ActionButton'
import withConfig from '../../utils/withConfig'
import * as UnlockTypes from '../../unlock'

interface Props {
  account: UnlockTypes.Account
  network: UnlockTypes.Network
  transactionFeed: UnlockTypes.Transaction[]
  explorerLinks: { [key: string]: string }
}

export const LogContent = ({
  account,
  network,
  transactionFeed,
  explorerLinks,
}: Props) => {
  return (
    <GlobalErrorConsumer>
      <Layout title="Creator Log">
        <Head>
          <title>{pageTitle('Log')}</title>
        </Head>
        {account && (
          <BrowserOnly>
            <AccountWrapper>
              <Account network={network} account={account} />
              <CreateLockButton>Create Lock</CreateLockButton>
            </AccountWrapper>
            <CreatorLog
              transactionFeed={transactionFeed}
              explorerLinks={explorerLinks}
            />
          </BrowserOnly>
        )}
      </Layout>
    </GlobalErrorConsumer>
  )
}

interface State {
  account: UnlockTypes.Account
  network: UnlockTypes.Network
  transactions: UnlockTypes.Transactions
}

interface Config {
  chainExplorerUrlBuilders: UnlockTypes.ChainExplorerURLBuilders
}

export const mapStateToProps = (
  { account, network, transactions }: State,
  { config: { chainExplorerUrlBuilders } }: { config: Config }
): Props => {
  const transactionFeed = Object.values(transactions).sort(
    (a, b) => b.blockNumber - a.blockNumber
  )

  const explorerLinks: { [key: string]: string } = {}

  transactionFeed.forEach(tx => {
    explorerLinks[tx.hash] = chainExplorerUrlBuilders.etherScan(tx.lock)
  })

  return {
    account,
    network,
    transactionFeed,
    explorerLinks,
  }
}

export default withConfig(connect(mapStateToProps)(LogContent))
