import React, { useEffect } from 'react'
import { useMachine } from '@xstate/react'
import Head from 'next/head'
import styled from 'styled-components'
import { useDispatch, connect } from 'react-redux'
import queryString from 'query-string'
import { UnlockError } from '../../utils/Error'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import { useCheckoutCommunication } from '../../hooks/useCheckoutCommunication'
import { checkoutMachine } from '../../stateMachines/checkout'
import CheckoutWrapper from '../interface/checkout/CheckoutWrapper'
import CheckoutContainer from '../interface/checkout/CheckoutContainer'
import { CheckoutErrors } from '../interface/checkout/CheckoutErrors'
import { NotLoggedIn } from '../interface/checkout/NotLoggedIn'
import { Locks } from '../interface/checkout/Locks'
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

interface CheckoutContentProps {
  account: AccountType
  configFromSearch?: PaywallConfig
  errors: UnlockError[]
}

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
  errors,
  configFromSearch,
  account,
}: CheckoutContentProps) => {
  const {
    emitCloseModal,
    emitTransactionInfo,
    config,
  } = useCheckoutCommunication()
  const reduxDispatch = useDispatch()
  const [current, send] = useMachine(checkoutMachine)
  const { setUserMetadata } = useSetUserMetadata()
  const { state } = useCheckoutStore()

  const paywallConfig = config || configFromSearch

  useEffect(() => {
    if (account && paywallConfig) {
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
        <BrowserOnly>
          {paywallConfig && paywallConfig.icon && (
            <PaywallLogo alt="Publisher Icon" src={paywallConfig.icon} />
          )}
          <p>{paywallConfig ? paywallConfig.callToAction.default : ''}</p>
          <CheckoutErrors
            errors={errors}
            resetError={(e: UnlockError) => reduxDispatch(resetError(e))}
          />
          {current.matches('loading') && <Loading />}
          {current.matches('notLoggedIn') && (
            <NotLoggedIn config={config!} lockAddresses={lockAddresses} />
          )}
          {current.matches('locks') && (
            <Locks
              accountAddress={account.address}
              lockAddresses={lockAddresses}
              emitTransactionInfo={emitTransactionInfo}
              metadataRequired={metadataRequired}
              showMetadataForm={() => send('collectMetadata')}
            />
          )}
          {current.matches('metadataForm') && (
            <MetadataForm
              fields={config!.metadataInputs!}
              onSubmit={onMetadataSubmit}
            />
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
