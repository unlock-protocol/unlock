import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import BrowserOnly from '../helpers/BrowserOnly'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import { Account as AccountType, Network } from '../../unlockTypes'
import { signData } from '../../actions/signature'
import KeyDetails from '../interface/keyChain/KeyDetails'

interface KeyChainContentProps {
  account: AccountType
  network: Network
  signData: (data: any, id: any) => void
}

export const KeyChainContent = ({
  account,
  network,
  signData,
}: KeyChainContentProps) => {
  return (
    <Layout title="Key Chain">
      <Head>
        <title>{pageTitle('Key Chain')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
          <KeyDetails
            address={account.address.toLowerCase()}
            signData={signData}
          />
          <DeveloperOverlay />
        </BrowserOnly>
      )}
      {!account && (
        // Default to sign up form. User can toggle to login. If email
        // address is truthy, do the signup flow.
        <LogInSignUp signup />
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

export default connect(
  mapStateToProps,
  { signData }
)(KeyChainContent)
