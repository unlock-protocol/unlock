import React, { useState, useEffect, createContext, useReducer } from 'react'
import PropTypes from 'prop-types'

import walletService from '../../services/walletService'
import useConfig from '../utils/useConfig'

export const WalletServiceContext = createContext()
export const WalletStateContext = createContext()

export default function WalletService({ children, noPoll = false }) {
  const { Provider: WalletServiceProvider } = WalletServiceContext
  const { Provider: WalletStateProvider } = WalletStateContext
  const config = useConfig()
  const [walletState, updateWalletState] = useReducer(
    (state, action) => {
      const { type, info } = action
      if (type === 'ready') {
        return {
          ...state,
          ready: true,
        }
      }
      if (type === 'account.changed') {
        const { account } = info
        return {
          ...state,
          account,
        }
      }
      if (type === 'network.changed') {
        const { network } = info
        return {
          ...state,
          network,
        }
      }
      return state
    },
    { ready: false, account: null, network: config.requiredNetworkId }
  )
  const [error, setError] = useState()
  const wallet = new walletService(config, !noPoll)
  wallet.on('ready', () => updateWalletState({ type: 'ready' }))
  wallet.on('account.changed', account =>
    updateWalletState({ type: 'account.changed', info: { account } })
  )
  wallet.on('network.changed', network =>
    updateWalletState({ type: 'network.changed', info: { network } })
  )

  wallet.on('error', e => setError(e))

  useEffect(() => {
    wallet.connect()
  }, [])

  if (error) throw error

  return (
    <WalletServiceProvider value={walletState.ready ? wallet : null}>
      <WalletStateProvider value={walletState}>{children}</WalletStateProvider>
    </WalletServiceProvider>
  )
}

WalletService.propTypes = {
  children: PropTypes.node.isRequired,
  noPoll: PropTypes.bool,
}

WalletService.defaultProps = {
  noPoll: false,
}
