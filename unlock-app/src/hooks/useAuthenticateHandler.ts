import { useCallback } from 'react'
import { useAuthenticate } from './useAuthenticate'
import { useAppStorage } from './useAppStorage'

enum WALLET_PROVIDER {
  METAMASK,
  WALLET_CONNECT,
  COINBASE,
  UNLOCK,
}

export type WalletProvider = keyof typeof WALLET_PROVIDER
interface AuthenticateHandler {
  injectedProvider?: any
}

export function useAuthenticateHandler({
  injectedProvider,
}: AuthenticateHandler) {
  const {
    handleInjectProvider,
    handleUnlockProvider,
    handleCoinbaseWalletProvider,
    handleWalletConnectProvider,
  } = useAuthenticate({ injectedProvider })
  const { setStorage, removeKey } = useAppStorage()

  const walletHandlers: {
    [key in WalletProvider]: (provider?: any) => Promise<any | void>
  } = {
    METAMASK: handleInjectProvider,
    WALLET_CONNECT: handleWalletConnectProvider,
    COINBASE: handleCoinbaseWalletProvider,
    UNLOCK: handleUnlockProvider,
  }

  const authenticateWithProvider = useCallback(
    async (providerType: WalletProvider, provider?: any) => {
      if (!walletHandlers[providerType]) {
        removeKey('provider')
      }
      const connectedProvider = await walletHandlers[providerType](provider)
      // We can't autologin with Unlock accounts
      if (providerType !== 'UNLOCK') {
        setStorage('provider', providerType)
      }
      return connectedProvider
    },
    []
  )

  return {
    authenticateWithProvider,
  }
}
