import { EthereumProvider } from '@walletconnect/ethereum-provider'

import WalletLink from 'walletlink'
import { useConfig } from '../utils/withConfig'
import { useAuth } from '../contexts/AuthenticationContext'
import { useAppStorage } from './useAppStorage'
import { useConnectModal } from './useConnectModal'
import { useCallback } from 'react'

export interface EthereumWindow extends Window {
  ethereum?: any
}

interface RpcType {
  [network: string]: string
}

export const RECENTLY_USED_PROVIDER = 'recently_used_provider'

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
  }
  return provider
}

interface AuthenticateProps {
  injectedProvider?: any | null
}

export enum WALLET_PROVIDER {
  METAMASK,
  DELEGATED_PROVIDER,
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
  const { send } = useConnectModal()

  const injectedOrDefaultProvider = injectedProvider || selectProvider(config)

  const handleInjectProvider = useCallback(async () => {
    return authenticate(injectedOrDefaultProvider)
  }, [authenticate, injectedOrDefaultProvider])

  const handleUnlockProvider = useCallback(
    async (provider: any) => {
      return authenticate(provider)
    },
    [authenticate]
  )

  const handleDelegatedProvider = useCallback(
    async (provider: any) => {
      return authenticate(provider)
    },
    [authenticate]
  )

  const handleWalletConnectProvider = useCallback(async () => {
    // requires @walletconnect/modal for showQrModal:true
    const client = await EthereumProvider.init({
      projectId: config.walletConnectApiKey,
      showQrModal: true, // if set to false, we could try displaying the QR code ourslves with on('display_uri')
      qrModalOptions: {
        themeMode: 'light',
      },
      chains: [1],
      optionalChains: Object.keys(config.networks).map((key) => {
        return parseInt(key)
      }),
    })

    // Todo" consider handling this in our modal directly
    // client.on('display_uri', (uri: string) => {
    //   console.log(uri)
    // })

    await client.connect()
    return authenticate(client)
  }, [authenticate, config])

  const handleCoinbaseWalletProvider = useCallback(async () => {
    const walletLink = new WalletLink({
      appName: 'Unlock',
      appLogoUrl: '/static/images/svg/default-lock-logo.svg',
    })

    const ethereum = walletLink.makeWeb3Provider(config.networks[1].provider, 1)
    return authenticate(ethereum)
  }, [authenticate, config])

  const walletHandlers: {
    [key in WalletProvider]: (provider?: any) => Promise<any | void>
  } = {
    DELEGATED_PROVIDER: handleDelegatedProvider,
    METAMASK: handleInjectProvider,
    WALLET_CONNECT: handleWalletConnectProvider,
    COINBASE: handleCoinbaseWalletProvider,
    UNLOCK: handleUnlockProvider,
  }

  const authenticateWithProvider = useCallback(
    async (providerType: WalletProvider, provider?: any) => {
      try {
        if (!walletHandlers[providerType]) {
          removeKey('provider')
        }
        const connectedProvider = walletHandlers[providerType](provider)

        const p = await connectedProvider
        if (!p?.account) {
          return console.error('Unable to get provider')
        }
        if (p?.provider?.isUnlock && p?.provider?.emailAddress) {
          setStorage('email', p?.provider?.emailAddress)
        } else {
          removeKey('email')
        }
        localStorage.setItem(RECENTLY_USED_PROVIDER, providerType)
        setStorage('provider', providerType)
        send(connectedProvider)
        return connectedProvider
      } catch (error) {
        console.error('We could not connect to the provider', error)
        return null
      }
    },
    [setStorage, removeKey, send]
  )

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
