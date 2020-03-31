import React, { useEffect } from 'react'
import styled from 'styled-components'
import { connect, useDispatch } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import { CheckoutLoginSignup } from '../interface/checkout/CheckoutLoginSignup'
import { Locks } from '../interface/checkout/Locks'
import { NotLoggedInLocks } from '../interface/checkout/NotLoggedInLocks'
import { FiatLocks } from '../interface/checkout/FiatLocks'
import CheckoutWrapper from '../interface/checkout/CheckoutWrapper'
import CheckoutContainer from '../interface/checkout/CheckoutContainer'
import { MetadataForm } from '../interface/checkout/MetadataForm'
import { CheckoutErrors } from '../interface/checkout/CheckoutErrors'
import { LogInButton } from '../interface/checkout/LogInButton'
import {
  Account as AccountType,
  Router,
  PaywallConfig,
  UserMetadata,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
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
import { UnlockError } from '../../utils/Error'
import { resetError } from '../../actions/error'

interface CheckoutContentProps {
  account: AccountType
  configFromSearch?: PaywallConfig
  errors: UnlockError[]
}

const defaultLockAddresses: string[] = []

// This component wraps CheckoutContentInner so that it has access to the store.
export const CheckoutContent = ({
  account,
  configFromSearch,
  errors,
}: CheckoutContentProps) => {
  return (
    <CheckoutStoreProvider>
      <CheckoutContentInner
        account={account}
        configFromSearch={configFromSearch}
        errors={errors}
      />
    </CheckoutStoreProvider>
  )
}

export const CheckoutContentInner = ({
  account,
  configFromSearch,
  errors,
}: CheckoutContentProps) => {
  const reduxDispatch = useDispatch()
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
    if (!config && configFromSearch) {
      dispatch(setConfig(configFromSearch))
    }
  }, [configFromSearch])

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

  const allowClose = !(!config || config.persistentCheckout)

  return (
    <CheckoutContainer close={emitCloseModal}>
      <CheckoutWrapper allowClose={allowClose} hideCheckout={emitCloseModal}>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <BrowserOnly>
          {config && config.icon && (
            <PaywallLogo alt="Publisher Icon" src={config.icon} />
          )}
          <p>{config ? config.callToAction.default : ''}</p>
          <CheckoutErrors
            errors={errors}
            resetError={(e: UnlockError) => reduxDispatch(resetError(e))}
          />
          {showingMetadataForm && (
            <MetadataForm
              fields={config!.metadataInputs!}
              onSubmit={onMetadataSubmit}
            />
          )}
          {!showingMetadataForm && (
            <>
              {!account && showingLogin && <CheckoutLoginSignup login />}
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
                <FiatLocks
                  lockAddresses={lockAddresses}
                  accountAddress={account.address}
                  emitTransactionInfo={emitTransactionInfo}
                  cards={account.cards || []}
                  metadataRequired={metadataRequired}
                />
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
  errors: UnlockError[]
}

export const mapStateToProps = ({ account, router, errors }: ReduxState) => {
  const search = queryString.parse(router.location.search)
  const configFromSearch = getConfigFromSearch(search)

  return {
    account,
    configFromSearch,
    errors,
  }
}

export default connect(mapStateToProps)(CheckoutContent)

const PaywallLogo = styled.img`
  max-width: 200px;
  align-self: start;
`
