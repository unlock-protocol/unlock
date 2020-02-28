import React, { useState } from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import { Locks } from '../interface/checkout/Locks'
import { NotLoggedInLocks } from '../interface/checkout/NotLoggedInLocks'
import CheckoutWrapper from '../interface/checkout/CheckoutWrapper'
import {
  Account as AccountType,
  Router,
  PaywallConfig,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import LogInSignUp from '../interface/user-account/LogInSignUp'

interface CheckoutContentProps {
  account: AccountType
  config?: PaywallConfig
}

const defaultLockAddresses: string[] = []

export const CheckoutContent = ({ account, config }: CheckoutContentProps) => {
  const lockAddresses = config
    ? Object.keys(config.locks)
                      : defaultLockAddresses
  const [showingLogin, setShowingLogin] = useState(false)

  return (
    <CheckoutWrapper allowClose hideCheckout={() => {}}>
      <Head>
        <title>{pageTitle('Checkout')}</title>
      </Head>
      <BrowserOnly>
        <p>{config ? config.callToAction.default : ''}</p>
        {!account && showingLogin && (
          <LogInSignUp login />
        )}
        {!account && !showingLogin && (
          <>
            <NotLoggedInLocks lockAddresses={lockAddresses} />
            <a onClick={() => setShowingLogin(true)}>Log in</a>
          </>
        )}
        {account && (
          <Locks
            accountAddress={account.address}
            lockAddresses={lockAddresses}
          />
        )}
      </BrowserOnly>
    </CheckoutWrapper>
  )
}

interface ReduxState {
  account: AccountType
  router: Router
}

export const mapStateToProps = ({ account, router }: ReduxState) => {
  const search = queryString.parse(router.location.search)

  const config = getConfigFromSearch(search)

  return {
    account,
    config,
  }
}

export default connect(mapStateToProps)(CheckoutContent)
