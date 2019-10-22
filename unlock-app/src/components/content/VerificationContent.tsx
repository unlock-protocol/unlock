import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import { Account as AccountType, Network } from '../../unlockTypes'

interface VerificationContentProps {
  account: AccountType
  network: Network
}

export const VerificationContent = ({
  account,
  network,
}: VerificationContentProps) => {
  return (
    <Layout title="Verification">
      <Head>
        <title>{pageTitle('Verification')}</title>
      </Head>
      {account && <Account network={network} account={account} />}
    </Layout>
  )
}

interface ReduxState {
  account: AccountType
  network: Network
}

export const mapStateToProps = ({
  account,
  network,
}: ReduxState): VerificationContentProps => {
  return {
    account,
    network,
  }
}

export default connect(mapStateToProps)(VerificationContent)
