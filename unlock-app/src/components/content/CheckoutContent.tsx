import React from 'react'
import { connect } from 'react-redux'
import queryString from 'query-string'
import { UnlockError } from '../../utils/Error'
import { Checkout } from '../interface/checkout/Checkout'
import {
  Account as AccountType,
  Router,
  PaywallConfig,
} from '../../unlockTypes'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import { CheckoutStoreProvider } from '../../hooks/useCheckoutStore'
import { useCheckoutCommunication } from '../../hooks/useCheckoutCommunication'

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
  const checkoutCommunication = useCheckoutCommunication()

  // We need to delay render until we have a config at least, and
  // further if we haven't yet set up the adapter for delegated web3
  // calls
  const noConfig =
    checkoutCommunication.insideIframe && !checkoutCommunication.config
  const noProviderAdapter =
    checkoutCommunication.config &&
    checkoutCommunication.config.useDelegatedProvider &&
    !checkoutCommunication.providerAdapter

  if (noConfig || noProviderAdapter) {
    return <></>
  }

  return (
    <CheckoutStoreProvider>
      <Checkout
        account={account}
        configFromSearch={configFromSearch}
        errors={errors}
        {...checkoutCommunication}
      />
    </CheckoutStoreProvider>
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
