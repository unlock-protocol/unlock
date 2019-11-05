import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import { Account as AccountType, Network } from '../../unlockTypes'

interface Props {
  account: AccountType
  network: Network
}

export const KeyMetadataContent = ({ account, network }: Props) => {
  return (
    <Layout title="Key Chain">
      <Head>
        <title>{pageTitle('Key Chain')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
        </BrowserOnly>
      )}
    </Layout>
  )
}

interface ReduxState {
  account: AccountType
  network: Network
}

export const mapStateToProps = ({ account, network }: ReduxState) => {
  return {
    account,
    network,
  }
}

export default connect(mapStateToProps)(KeyMetadataContent)
