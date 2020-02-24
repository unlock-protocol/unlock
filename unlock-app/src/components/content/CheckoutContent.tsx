import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import { Locks } from '../interface/checkout/Locks'
import {
  Account as AccountType,
  Network,
  Router,
  PaywallConfig,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'

interface CheckoutContentProps {
  account: AccountType
  network: Network
  config?: PaywallConfig
}

const defaultLockAddresses: string[] = []

export const CheckoutContent = ({
  account,
  network,
  config,
}: CheckoutContentProps) => {
  const lockAddresses = config
    ? Object.keys(config.locks)
    : defaultLockAddresses

  return (
    <Layout title="Checkout">
      <Head>
        <title>{pageTitle('Checkout')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
          <Locks
            accountAddress={account.address}
            lockAddresses={lockAddresses}
          />
        </BrowserOnly>
      )}
    </Layout>
  )
}

interface ReduxState {
  account: AccountType
  network: Network
  router: Router
}

export const mapStateToProps = ({ account, network, router }: ReduxState) => {
  const search = queryString.parse(router.location.search)

  const config = getConfigFromSearch(search)

  return {
    account,
    network,
    config,
  }
}

export default connect(mapStateToProps)(CheckoutContent)
