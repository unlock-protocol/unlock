import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import { Locks } from '../interface/checkout/Locks'
import { NotLoggedInLocks } from '../interface/checkout/NotLoggedInLocks'
import CheckoutWrapper from '../interface/checkout/CheckoutWrapper'
import {
  Account as AccountType,
  Router,
  PaywallConfig,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import { useCheckoutCommunication } from '../../hooks/useCheckoutCommunication'

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

  const {
    emitTransactionInfo,
    emitCloseModal,
    emitUserInfo,
    ready,
  } = useCheckoutCommunication()

  useEffect(() => {
    if (ready && account && account.address) {
      emitUserInfo({
        address: account.address,
      })
    }
  }, [account])

  return (
    <CheckoutWrapper allowClose hideCheckout={emitCloseModal}>
      <Head>
        <title>{pageTitle('Checkout')}</title>
      </Head>
      <BrowserOnly>
        {config && config.icon && (
          <img alt="Publisher Icon" src={config.icon} />
        )}
        <p>{config ? config.callToAction.default : ''}</p>
        {!account && showingLogin && <LogInSignUp login embedded />}
        {!account && !showingLogin && (
          <>
            <NotLoggedInLocks lockAddresses={lockAddresses} />
            <input
              type="button"
              onClick={() => setShowingLogin(true)}
              value="Log in"
            />
          </>
        )}
        {account && (
          <Locks
            accountAddress={account.address}
            lockAddresses={lockAddresses}
            emitTransactionInfo={emitTransactionInfo}
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
