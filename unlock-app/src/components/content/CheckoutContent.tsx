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
  RawLock,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import { durationsAsTextFromSeconds } from '../../utils/durations'
import { usePaywallLocks } from '../../hooks/usePaywallLocks'

interface CheckoutContentProps {
  account: AccountType
  network: Network
  config?: PaywallConfig
}

const defaultLockAddresses: string[] = []

const lockKeysAvailable = (lock: RawLock) => {
  if ((lock as any).unlimitedKeys) {
    return 'Unlimited'
  }

  // maxNumberOfKeys and outstandingKeys are assumed to be defined
  // if they are ever not, a runtime error can occur
  return (lock.maxNumberOfKeys! - lock.outstandingKeys!).toString()
}

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
                <Lock
                  name={lock.name}
                  keysAvailable={lockKeysAvailable(lock)}
                  key={lock.name}
                  price={lock.keyPrice}
                  symbol={(lock as any).currencySymbol || 'ETH'}
                  validityDuration={durationsAsTextFromSeconds(
                    lock.expirationDuration
                  )}
                />
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
