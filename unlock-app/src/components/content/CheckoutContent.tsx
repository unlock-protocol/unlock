import React, { useContext, useState, useEffect, useRef } from 'react'
import { Checkout } from '../interface/checkout/Checkout'
import { getPaywallConfigFromQuery } from '../../utils/paywallConfig'
import getOAuthFromSearch from '../../utils/oauth'
import { useCheckoutCommunication } from '../../hooks/useCheckoutCommunication'
import Loading from '../interface/Loading'
import { ConfigContext } from '../../utils/withConfig'
import LocksContext from '../../contexts/LocksContext'
import { selectProvider } from '../../hooks/useAuthenticate'

interface CheckoutContentProps {
  query: any
}

export const CheckoutContent = ({ query }: CheckoutContentProps) => {
  const [defaultState, setDefaultState] = useState('loading')
  const defaultStateRef = useRef(defaultState)
  defaultStateRef.current = defaultState
  const checkoutCommunication = useCheckoutCommunication()
  const configFromSearch = getPaywallConfigFromQuery(query)
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

  console.log(paywallConfig)
  const oAuthConfig = getOAuthFromSearch(query)

  useEffect(() => {
    if (oAuthConfig) {
      setDefaultState('connect')
    } else if (paywallConfig) {
      setDefaultState('pick-lock')
    }
  }, [oAuthConfig, paywallConfig])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (defaultStateRef.current === 'loading') {
        setDefaultState('config-error')
      }
    }, 30000)
    return () => clearTimeout(timer)
  }, [])

  if (noProviderAdapter) {
    return <Loading />
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
