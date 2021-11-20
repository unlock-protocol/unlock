import WalletConnectProvider from '@walletconnect/web3-provider'
import { useContext } from 'react'
import WalletLink from 'walletlink'
import { AuthenticationContext } from '../components/interface/Authenticate'
import { rpcForWalletConnect } from '../components/interface/LoginPrompt'
import { ConfigContext } from '../utils/withConfig'

export interface EthereumWindow extends Window {
  ethereum?: any
  web3?: any
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
  onProvider?: ((provider?: any) => void) | undefined
  authenticate?: (provider: any, messageToSign?: any) => Promise<any>
}

export function useAuthenticate({
  injectedProvider,
  onProvider,
  authenticate,
}: AuthenticateProps) {
  const authCtx = useContext(AuthenticationContext)
  const authenticateFn = authenticate ?? authCtx?.authenticate
  const config = useContext(ConfigContext)

  const injectedOrDefaultProvider = injectedProvider || selectProvider(config)

  const authenticateIfNotHandled = async (provider: any) => {
    if (onProvider) {
      await onProvider(provider)
    } else {
      await authenticateFn(provider)
    }
  }

  const handleInjectProvider = async () => {
    await authenticateIfNotHandled(injectedOrDefaultProvider)
  }

  const handleUnlockProvider = async (provider: any) => {
    await authenticateIfNotHandled(provider)
  }

  const handleWalletConnectProvider = async () => {
    const walletConnectProvider = new WalletConnectProvider({
      rpc: rpcForWalletConnect(config),
    })
    await authenticateIfNotHandled(walletConnectProvider)
  }

  const handleCoinbaseWalletProvider = async () => {
    const walletLink = new WalletLink({
      appName: 'Unlock',
      appLogoUrl: '/static/images/svg/default-lock-logo.svg',
    })

    const ethereum = walletLink.makeWeb3Provider(config.networks[1].provider, 1)
    await authenticateIfNotHandled(ethereum)
  }

  return {
    handleUnlockProvider,
    handleInjectProvider,
    handleWalletConnectProvider,
    handleCoinbaseWalletProvider,
    injectedOrDefaultProvider,
  }
}
