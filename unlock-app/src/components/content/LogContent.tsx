import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import BrowserOnly from '../helpers/BrowserOnly'
import CreatorLog from '../creator/CreatorLog'
import { pageTitle } from '../../constants'
import withConfig from '../../utils/withConfig'
/* eslint-disable no-unused-vars */
import * as UnlockTypes from '../../unlockTypes'
/* eslint-enable no-unused-vars */

import {
  CreateLockButton,
  AccountWrapper,
} from '../interface/buttons/ActionButton'
import { showForm } from '../../actions/lockFormVisibility'

interface Props {
  account: UnlockTypes.Account
  network: UnlockTypes.Network
  transactionFeed: UnlockTypes.Transaction[]
  explorerLinks: { [key: string]: string }
  showForm?: () => any
}

export const LogContent = ({
  account,
  network,
  transactionFeed,
  explorerLinks,
  showForm,
}: Props) => {
  return (
    <Layout title="Creator Log">
      <Head>
        <title>{pageTitle('Log')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <AccountWrapper>
            <Account network={network} account={account} />
            <Link href="/dashboard">
              <CreateLockButton onClick={showForm} id="CreateLockButton">
                Create Lock
              </CreateLockButton>
            </Link>
          </AccountWrapper>
          <CreatorLog
            transactionFeed={transactionFeed}
            explorerLinks={explorerLinks}
          />
        </BrowserOnly>
      )}
    </Layout>
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

const mapDispatchToProps = (dispatch: any) => ({
  showForm: () => dispatch(showForm()),
})

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LogContent)
)
