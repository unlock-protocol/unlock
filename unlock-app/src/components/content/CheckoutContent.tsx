import React, { useContext, useState } from 'react'
import { Checkout } from '../interface/checkout/Checkout'
import getConfigFromSearch from '../../utils/getConfigFromSearch'
import getOAuthFromSearch from '../../utils/getOAuthFromSearch'
import { useCheckoutCommunication } from '../../hooks/useCheckoutCommunication'
import Loading from '../interface/Loading'
import { ConfigContext } from '../../utils/withConfig'
import { selectProvider } from '../interface/LoginPrompt'
import LocksContext from '../../contexts/LocksContext'

interface CheckoutContentProps {
  query: any
}

export const CheckoutContent = ({ query }: CheckoutContentProps) => {
  const checkoutCommunication = useCheckoutCommunication()
  const configFromSearch = getConfigFromSearch(query)
  const config = useContext(ConfigContext)
  const [locks, setLocks] = useState({})
  // We need to delay render until we have a config at least, and
  // further if we haven't yet set up the adapter for delegated web3
  // calls
  const noProviderAdapter =
    checkoutCommunication.paywallConfig &&
    checkoutCommunication.paywallConfig.useDelegatedProvider &&
    !checkoutCommunication.providerAdapter

  const paywallConfig = checkoutCommunication.paywallConfig || configFromSearch
  const addLock = (lock: any) => {
    return setLocks({
      ...locks,
      [lock.address]: lock,
    })
  }

  if (noProviderAdapter) {
    return <Loading />
  }

  const oAuthConfig = getOAuthFromSearch(query)

  let defaultState = 'loading'
  if (oAuthConfig) {
    defaultState = 'connect'
  } else if (paywallConfig) {
    defaultState = 'pick-lock'
  }
  return (
    <LocksContext.Provider
      value={{
        locks,
        addLock,
      }}
    >
      <Checkout
        {...checkoutCommunication}
        web3Provider={
          checkoutCommunication.providerAdapter || selectProvider(config)
        }
        redirectUri={
          oAuthConfig?.redirectUri ||
          paywallConfig?.redirectUri ||
          query?.redirectUri
        }
        oAuthConfig={oAuthConfig}
        defaultState={defaultState}
        paywallConfig={paywallConfig} // last to avoid override by ...checkoutCommunication
      />
    </LocksContext.Provider>
  )
}

export default CheckoutContent
