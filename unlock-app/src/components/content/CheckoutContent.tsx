import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import { Lock, LoadingLock } from '../interface/checkout/Lock'
import {
  Account as AccountType,
  Network,
  Router,
  PaywallConfig,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import { usePaywallLocks } from '../../hooks/usePaywallLocks'

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

  const { locks, loading } = usePaywallLocks(lockAddresses)

  return (
    <Layout title="Checkout">
      <Head>
        <title>{pageTitle('Checkout')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
          {loading && (
            <div>
              {lockAddresses.map(address => (
                <LoadingLock key={address} />
              ))}
            </div>
          )}
          {locks && (
            <div>
              {locks.map(lock => (
                <Lock lock={lock} key={lock.name} />
              ))}
            </div>
          )}
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
