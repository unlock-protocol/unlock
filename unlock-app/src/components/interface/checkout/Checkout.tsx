import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import Head from 'next/head'
import styled from 'styled-components'
import { useMachine } from '@xstate/react'
import CheckoutWrapper from './CheckoutWrapper'
import CheckoutContainer from './CheckoutContainer'
import { CheckoutErrors } from './CheckoutErrors'
import { NotLoggedIn } from './NotLoggedIn'
import { Locks } from './Locks'
import { FiatLocks } from './FiatLocks'
import { CallToAction } from './CallToAction'
import { SwitchPayment } from './SwitchPayment'
import MetadataForm from './MetadataForm'
import Loading from '../Loading'
import { pageTitle } from '../../../constants'
import {
  Account as AccountType,
  PaywallConfig,
  UserMetadata,
} from '../../../unlockTypes'
import { UnlockError } from '../../../utils/Error'
import { resetError } from '../../../actions/error'

import { checkoutMachine, CheckoutState } from '../../../stateMachines/checkout'
import {
  UserInfo,
  TransactionInfo,
} from '../../../hooks/useCheckoutCommunication'
import { useSetUserMetadata } from '../../../hooks/useSetUserMetadata'
import { useCheckoutStore } from '../../../hooks/useCheckoutStore'
import { useProvider } from '../../../hooks/useProvider'

interface CheckoutProps {
  account: AccountType
  configFromSearch?: PaywallConfig
  errors: UnlockError[]
  emitCloseModal: () => void
  emitTransactionInfo: (info: TransactionInfo) => void
  emitUserInfo: (info: UserInfo) => void
  config?: PaywallConfig
  providerAdapter: any
}

export const Checkout = ({
  errors,
  configFromSearch,
  account,
  emitCloseModal,
  emitTransactionInfo,
  emitUserInfo,
  config,
  providerAdapter,
}: CheckoutProps) => {
  // solely called for side effect of initializing with provider
  useProvider(providerAdapter)
  const reduxDispatch = useDispatch()
  const [current, send] = useMachine(checkoutMachine)
  const { setUserMetadata } = useSetUserMetadata()
  const { state } = useCheckoutStore()
  const [activePayment, setActivePayment] = useState<string | null>(null)

  const paywallConfig = config || configFromSearch

  useEffect(() => {
    if (account) {
      emitUserInfo({ address: account.address })
    }

    if (account && account.emailAddress && paywallConfig) {
      send('gotConfigAndUserAccount')
    } else if (account && paywallConfig) {
      send('gotConfigAndAccount')
    } else if (paywallConfig) {
      setTimeout(() => send('gotConfig'), 500)
    }
  }, [JSON.stringify(account), JSON.stringify(paywallConfig)])

  const allowClose = !(!paywallConfig || paywallConfig.persistentCheckout)
  const lockAddresses = paywallConfig ? Object.keys(paywallConfig.locks) : []
  const metadataRequired = paywallConfig
    ? !!paywallConfig.metadataInputs
    : false

  const onMetadataSubmit = (metadata: UserMetadata) => {
    const { delayedPurchase } = state
    setUserMetadata(
      delayedPurchase!.lockAddress,
      account!.address,
      metadata,
      delayedPurchase!.purchaseKey
    )
    send('metadataSubmitted')
  }

  return (
    <CheckoutContainer close={emitCloseModal}>
      <CheckoutWrapper allowClose={allowClose} hideCheckout={emitCloseModal}>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        {paywallConfig && paywallConfig.icon && (
          <PaywallLogo alt="Publisher Icon" src={paywallConfig.icon} />
        )}
        {paywallConfig && (
          <CallToAction
            state={current.value}
            callToAction={paywallConfig.callToAction}
          />
        )}
        <CheckoutErrors
          errors={errors}
          resetError={(e: UnlockError) => reduxDispatch(resetError(e))}
        />
        {current.matches(CheckoutState.loading) && <Loading />}
        {current.matches(CheckoutState.notLoggedIn) && (
          <NotLoggedIn config={paywallConfig!} lockAddresses={lockAddresses} />
        )}
        {current.matches(CheckoutState.locks) && (
          <Locks
            accountAddress={account.address}
            lockAddresses={lockAddresses}
            emitTransactionInfo={emitTransactionInfo}
            metadataRequired={metadataRequired}
            showMetadataForm={() => send('collectMetadata')}
            config={paywallConfig!}
          />
        )}
        {current.matches(CheckoutState.fiatLocks) && (
          <FiatLocks
            accountAddress={account.address}
            lockAddresses={lockAddresses}
            emitTransactionInfo={emitTransactionInfo}
            metadataRequired={metadataRequired}
            showMetadataForm={() => send('collectMetadata')}
            config={paywallConfig!}
          />
        )}
        {(current.matches(CheckoutState.fiatLocks) ||
          current.matches(CheckoutState.locks)) &&
          !account.emailAddress &&
          !!paywallConfig!.unlockUserAccounts && (
            <SwitchPayment
              paymentOptions={['Credit Card']}
              activePayment={activePayment}
              setActivePayment={(option: string | null) => {
                setActivePayment(option)
                send('changeCurrency')
              }}
            />
          )}
        {current.matches(CheckoutState.metadataForm) && (
          <MetadataForm
            fields={paywallConfig!.metadataInputs!}
            onSubmit={onMetadataSubmit}
          />
        )}
      </CheckoutWrapper>
    </CheckoutContainer>
  )
}

const PaywallLogo = styled.img`
  max-width: 200px;
  align-self: start;
`
