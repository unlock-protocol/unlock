import React, { useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'
import Head from 'next/head'
import styled from 'styled-components'
import { useDispatch, connect } from 'react-redux'
import queryString from 'query-string'
import { UnlockError } from '../../utils/Error'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import {
  useCheckoutCommunication,
  TransactionInfo,
  UserInfo,
} from '../../hooks/useCheckoutCommunication'
import { checkoutMachine, CheckoutState } from '../../stateMachines/checkout'
import CheckoutWrapper from '../interface/checkout/CheckoutWrapper'
import CheckoutContainer from '../interface/checkout/CheckoutContainer'
import { CheckoutErrors } from '../interface/checkout/CheckoutErrors'
import { NotLoggedIn } from '../interface/checkout/NotLoggedIn'
import { Locks } from '../interface/checkout/Locks'
import { FiatLocks } from '../interface/checkout/FiatLocks'
import { CallToAction } from '../interface/checkout/CallToAction'
import { SwitchPayment } from '../interface/checkout/SwitchPayment'
import Loading from '../interface/Loading'
import { resetError } from '../../actions/error'
import {
  Account as AccountType,
  Router,
  PaywallConfig,
  UserMetadata,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import {
  CheckoutStoreProvider,
  useCheckoutStore,
} from '../../hooks/useCheckoutStore'
import MetadataForm from '../interface/checkout/MetadataForm'
import { useSetUserMetadata } from '../../hooks/useSetUserMetadata'
import { useProvider } from '../../hooks/useProvider'

interface CheckoutContentProps {
  account: AccountType
  configFromSearch?: PaywallConfig
  errors: UnlockError[]
}

export const CheckoutContent = (props: CheckoutContentProps) => {
  return (
    <BrowserOnly>
      <CheckoutContentInnerOuter {...props} />
    </BrowserOnly>
  )
}

export const CheckoutContentInnerOuter = ({
  account,
  configFromSearch,
  errors,
}: CheckoutContentProps) => {
  const checkoutCommunication = useCheckoutCommunication()

  if (checkoutCommunication.insideIframe && !checkoutCommunication.config) {
    return <Loading />
  }

  return (
    <CheckoutStoreProvider>
      <CheckoutContentInner
        account={account}
        configFromSearch={configFromSearch}
        errors={errors}
        {...checkoutCommunication}
      />
    </CheckoutStoreProvider>
  )
}

interface CheckoutContentInnerProps {
  account: AccountType
  configFromSearch?: PaywallConfig
  config?: PaywallConfig
  emitTransactionInfo: (info: TransactionInfo) => void
  emitUserInfo: (info: UserInfo) => void
  emitCloseModal: () => void
  providerAdapter: any
  errors: UnlockError[]
}

export const CheckoutContentInner = ({
  errors,
  configFromSearch,
  account,
  emitCloseModal,
  emitTransactionInfo,
  emitUserInfo,
  providerAdapter,
  config,
}: CheckoutContentInnerProps) => {
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

  const { loading } = useProvider(providerAdapter)
  if (loading) {
    return <></>
  }

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
