import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
import { useConfig } from '../utils/withConfig'
import { useAuth } from '../contexts/AuthenticationContext'
import { useAppStorage } from './useAppStorage'

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

export enum WALLET_PROVIDER {
  METAMASK,
  WALLET_CONNECT,
  COINBASE,
  UNLOCK,
}

export type WalletProvider = keyof typeof WALLET_PROVIDER

export function useAuthenticate(options: AuthenticateProps = {}) {
  const { injectedProvider } = options
  const config = useConfig()
  const { authenticate } = useAuth()
  const { setStorage, removeKey } = useAppStorage()

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

  const walletHandlers: {
    [key in WalletProvider]: (provider?: any) => Promise<any | void>
  } = {
    METAMASK: handleInjectProvider,
    WALLET_CONNECT: handleWalletConnectProvider,
    COINBASE: handleCoinbaseWalletProvider,
    UNLOCK: handleUnlockProvider,
  }

  async function authenticateWithProvider(
    providerType: WalletProvider,
    provider?: any
  ) {
    if (!walletHandlers[providerType]) {
      removeKey('provider')
    }
    const connectedProvider = walletHandlers[providerType](provider)

    connectedProvider.then((p) => {
      if (!p?.account) {
        return console.error('Unable to get provider')
      }
      if (p?.isUnlock && p?.email) {
        setStorage('email', p.email)
      } else {
        removeKey('email')
      }
      setStorage('provider', providerType)
    })
    return connectedProvider
  }

  return {
    handleUnlockProvider,
    handleInjectProvider,
    handleWalletConnectProvider,
    handleCoinbaseWalletProvider,
    injectedOrDefaultProvider,
    authenticate,
    authenticateWithProvider,
  }
}
