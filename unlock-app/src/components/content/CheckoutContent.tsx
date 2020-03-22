import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import { Locks } from '../interface/checkout/Locks'
import { NotLoggedInLocks } from '../interface/checkout/NotLoggedInLocks'
import { UserAccountLocks } from '../interface/checkout/UserAccountLocks'
import CheckoutWrapper from '../interface/checkout/CheckoutWrapper'
import CheckoutContainer from '../interface/checkout/CheckoutContainer'
import { MetadataForm } from '../interface/checkout/MetadataForm'
import { LogInButton } from '../interface/checkout/LogInButton'
import {
  Account as AccountType,
  Router,
  PaywallConfig,
  UserMetadata,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import getConfigFromDom from '../../utils/getConfigFromDom'
import { useCheckoutCommunication } from '../../hooks/useCheckoutCommunication'
import {
  useCheckoutStore,
  CheckoutStoreProvider,
} from '../../hooks/useCheckoutStore'

import {
  setConfig,
  setShowingLogin,
  setShowingMetadataForm,
} from '../../utils/checkoutActions'
import { useSetUserMetadata } from '../../hooks/useSetUserMetadata'

interface CheckoutContentProps {
  account: AccountType
  defaultConfig?: PaywallConfig
}

const defaultLockAddresses: string[] = []

// This component wraps CheckoutContentInner so that it has access to the store.
export const CheckoutContent = ({
  account,
  defaultConfig,
}: CheckoutContentProps) => {
  return (
    <CheckoutStoreProvider>
      <CheckoutContentInner account={account} defaultConfig={defaultConfig} />
    </CheckoutStoreProvider>
  )
}

export const CheckoutContentInner = ({
  account,
  defaultConfig,
}: CheckoutContentProps) => {
  const { state, dispatch } = useCheckoutStore()
  const { setUserMetadata } = useSetUserMetadata()
  const { showingLogin, config, showingMetadataForm, delayedPurchase } = state

  const {
    emitTransactionInfo,
    emitCloseModal,
    emitUserInfo,
  } = useCheckoutCommunication({
    setConfig: (config: PaywallConfig) => {
      dispatch(setConfig(config))
    },
  })

  useEffect(() => {
    if (account && account.address) {
      emitUserInfo({
        address: account.address,
      })
    }
  }, [account])

  useEffect(() => {
    if (!config && defaultConfig) {
      dispatch(setConfig(defaultConfig))
    }
  }, [defaultConfig])

  const lockAddresses = config
    ? Object.keys(config.locks)
    : defaultLockAddresses

  const metadataRequired = config ? !!config.metadataInputs : false
  const onMetadataSubmit = (metadata: UserMetadata) => {
    setUserMetadata(
      delayedPurchase!.lockAddress,
      account!.address,
      metadata,
      delayedPurchase!.purchaseKey
    )
    dispatch(setShowingMetadataForm(false))
  }

  return (
    <CheckoutContainer close={emitCloseModal}>
      <CheckoutWrapper allowClose hideCheckout={emitCloseModal}>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <BrowserOnly>
          {showingMetadataForm && (
            <MetadataForm
              fields={config!.metadataInputs!}
              onSubmit={onMetadataSubmit}
            />
          )}
          {!showingMetadataForm && (
            <>
              {config && config.icon && (
                <img alt="Publisher Icon" src={config.icon} />
              )}
              <p>{config ? config.callToAction.default : ''}</p>
              {!account && showingLogin && <LogInSignUp login embedded />}
              {!account && !showingLogin && (
                <>
                  <NotLoggedInLocks lockAddresses={lockAddresses} />
                  {config && config.unlockUserAccounts && (
                    <LogInButton
                      onClick={() => dispatch(setShowingLogin(true))}
                    />
                  )}
                </>
              )}
              {account && !account.emailAddress && (
                <Locks
                  accountAddress={account.address}
                  lockAddresses={lockAddresses}
                  emitTransactionInfo={emitTransactionInfo}
                  metadataRequired={metadataRequired}
                />
              )}
              {account && account.emailAddress && (
                <UserAccountLocks lockAddresses={lockAddresses} />
              )}
            </>
          )}
        </BrowserOnly>
      </CheckoutWrapper>
    </CheckoutContainer>
  )
}

interface ReduxState {
  account: AccountType
  router: Router
}

export const mapStateToProps = ({ account, router }: ReduxState) => {
  const search = queryString.parse(router.location.search)

  const configFromSearch = getConfigFromSearch(search)
  const configFromDom = getConfigFromDom()

  return {
    account,
    defaultConfig: configFromSearch || configFromDom,
  }
}

export default connect(mapStateToProps)(CheckoutContent)
