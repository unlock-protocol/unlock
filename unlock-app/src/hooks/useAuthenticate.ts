import WalletConnectProvider from '@walletconnect/web3-provider'
import { useContext } from 'react'
import WalletLink from 'walletlink'
import { ConfigContext } from '../utils/withConfig'
import { AuthenticationContext } from '../contexts/AuthenticationContext'

export interface EthereumWindow extends Window {
  ethereum?: any
  web3?: any
}

interface RpcType {
  [network: string]: string
}

export const rpcForWalletConnect = (config: any) => {
  const rpc: RpcType = {}
  Object.keys(config.networks).forEach((key) => {
    rpc[key] = config.networks[key].provider
  })
  return rpc
}

export const selectProvider = (config: any) => {
  let provider
  if (config?.isServer) {
    return null
  }
  const ethereumWindow: EthereumWindow = window

  if (config?.env === 'test') {
    // We set the provider to be the provider by the local eth node
    provider = `http://${config.httpProvider}:8545`
  } else if (ethereumWindow && ethereumWindow.ethereum) {
    provider = ethereumWindow.ethereum
  } else if (ethereumWindow.web3) {
    // Legacy web3 wallet/browser (should we keep supporting?)
    provider = ethereumWindow.web3.currentProvider
  } else {
    // TODO: Let's let the user pick one up from the UI (including the unlock provider!)
  }
  return provider
}

interface AuthenticateProps {
  injectedProvider?: any | null
}

export function useAuthenticate({ injectedProvider }: AuthenticateProps) {
  const config = useContext(ConfigContext)
  const { authenticate } = useContext(AuthenticationContext)

  const injectedOrDefaultProvider = injectedProvider || selectProvider(config)

  const handleInjectProvider = async () => {
    return authenticate(injectedOrDefaultProvider)
  }

  const handleUnlockProvider = async (provider: any) => {
    return authenticate(provider)
  }

  const handleWalletConnectProvider = async () => {
    const walletConnectProvider = new WalletConnectProvider({
      rpc: rpcForWalletConnect(config),
    })
    return authenticate(walletConnectProvider)
  }

  const handleCoinbaseWalletProvider = async () => {
    const walletLink = new WalletLink({
      appName: 'Unlock',
      appLogoUrl: '/static/images/svg/default-lock-logo.svg',
    })

    const ethereum = walletLink.makeWeb3Provider(config.networks[1].provider, 1)
    return authenticate(ethereum)
  }

  return {
    handleUnlockProvider,
    handleInjectProvider,
    handleWalletConnectProvider,
    handleCoinbaseWalletProvider,
    injectedOrDefaultProvider,
    authenticate,
  }
}
