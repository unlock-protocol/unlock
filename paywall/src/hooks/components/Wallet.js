import Web3 from 'web3'
import React, { useState, useEffect, createContext } from 'react'
import PropTypes from 'prop-types'
import { MISSING_PROVIDER, NOT_ENABLED_IN_PROVIDER } from '../../errors'
import useConfig from '../utils/useConfig'

export const WalletContext = createContext()

export function useCreateWallet() {
  const { providers } = useConfig()
  if (!providers.length) {
    throw new Error(MISSING_PROVIDER)
  }
  const provider = providers[0]
  const [web3, setWeb3] = useState()
  const [error, setError] = useState(false)

  const setup = () => {
    try {
      setWeb3(new Web3(provider))
    } catch (e) {
      setError(new Error(MISSING_PROVIDER))
    }
  }
  const prepare = async () => {
    try {
      // this exists for metamask and other modern dapp wallets and must be called,
      // see: https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
      await provider.enable()
      setup()
    } catch (error) {
      // we use setError because we are not in the render phase, so this will not be caught
      // by error boundaries
      setError(new Error(NOT_ENABLED_IN_PROVIDER))
    }
  }
  useEffect(
    () => {
      if (!provider.enable) {
        setup()
      } else {
        // we can't call async functions directly because they return a promise,
        // and useEffect assumes the return from an effect is a cleanup function
        prepare()
      }
    },
    // this effect will only re-run if the provider given to us by configuration changes
    // currently, that's never, but leaves open the possibility of future changes.
    // It will not, however, re-run on any other component update, which is a good thing
    [provider]
  )

  if (error) throw error

  return web3
}

export default function Wallet({ children }) {
  const wallet = useCreateWallet()

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  )
}

Wallet.propTypes = {
  children: PropTypes.node.isRequired,
}
