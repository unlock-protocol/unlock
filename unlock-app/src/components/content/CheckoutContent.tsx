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
import CheckoutContainer from '../interface/checkout/CheckoutContainer'
import { MetadataForm } from '../interface/checkout/MetadataForm'
import {
  Account as AccountType,
  Router,
  PaywallConfig,
  UserMetadata,
  DelayedPurchase,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import { useCheckoutCommunication } from '../../hooks/useCheckoutCommunication'
import { useSetUserMetadata } from '../../hooks/useSetUserMetadata'

interface CheckoutContentProps {
  account: AccountType
  configFromSearch?: PaywallConfig
}

const defaultLockAddresses: string[] = []

export const CheckoutContent = ({
  account,
  configFromSearch,
}: CheckoutContentProps) => {
  const [showingLogin, setShowingLogin] = useState(false)
  const [showingMetadataForm, setShowingMetadataForm] = useState(false)
  const [configFromPostmate, setConfig] = useState<PaywallConfig | undefined>(
    undefined
  )
  const { setUserMetadata } = useSetUserMetadata()
  const [delayedPurchase, setDelayedPurchase] = useState<
    DelayedPurchase | undefined
  >(undefined)

  const {
    emitTransactionInfo,
    emitCloseModal,
    emitUserInfo,
  } = useCheckoutCommunication({ setConfig })

  useEffect(() => {
    if (account && account.address) {
      emitUserInfo({
        address: account.address,
      })
    }
  }, [account])

  // Config value from postmate always takes precedence over the one in the URL if it is present.
  const config = configFromPostmate || configFromSearch

  const metadataRequired = config ? !!config.metadataInputs : false

  const onMetadataSubmit = (metadata: UserMetadata) => {
    setUserMetadata(
      delayedPurchase!.lockAddress,
      account.address,
      metadata,
      delayedPurchase!.purchaseKey
    )
    setShowingMetadataForm(false)
  }

  const lockAddresses = config
    ? Object.keys(config.locks)
    : defaultLockAddresses

  return (
    <CheckoutContainer close={emitCloseModal}>
      <CheckoutWrapper allowClose hideCheckout={emitCloseModal}>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <BrowserOnly>
          {showingMetadataForm && config?.metadataInputs && (
            <MetadataForm
              fields={config.metadataInputs}
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
                  metadataRequired={metadataRequired}
                  setDelayedPurchase={setDelayedPurchase}
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
}

export const mapStateToProps = ({ account, router }: ReduxState) => {
  const search = queryString.parse(router.location.search)

  const configFromSearch = getConfigFromSearch(search)

  return {
    account,
    configFromSearch,
  }
}

export default connect(mapStateToProps)(CheckoutContent)
