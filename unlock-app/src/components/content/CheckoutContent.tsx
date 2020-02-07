import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import { Account as AccountType, Network } from '../../unlockTypes'

interface CheckoutContentProps {
  account: AccountType
  network: Network
}

export const CheckoutContent = ({ account, network }: CheckoutContentProps) => {
  return (
    <Layout title="Checkout">
      <Head>
        <title>{pageTitle('Checkout')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
        </BrowserOnly>
      )}
      {!account && (
        // Default to log in form. User can toggle to signup.
        <LogInSignUp login />
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

export default connect(mapStateToProps)(CheckoutContent)
