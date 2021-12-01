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
  authenticate?: (provider: any, messageToSign?: any) => Promise<any>
}
export function useAuthenticateHandler({
  injectedProvider,
  authenticate,
}: AuthenticateHandler) {
  const {
    handleInjectProvider,
    handleUnlockProvider,
    handleCoinbaseWalletProvider,
    handleWalletConnectProvider,
  } = useAuthenticate({ injectedProvider, authenticate })
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
        return
      }
      await walletHandlers[providerType](provider)
      // We can't autologin with Unlock accounts
      if (providerType !== 'UNLOCK') {
        setStorage('provider', providerType)
      }
    },
    []
  )

  return {
    authenticateWithProvider,
  }
}
