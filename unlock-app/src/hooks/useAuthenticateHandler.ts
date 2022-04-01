import toast from 'react-hot-toast'
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

  async function authenticateWithProvider(
    providerType: WalletProvider,
    provider?: any
  ) {
    if (!walletHandlers[providerType]) {
      removeKey('provider')
    }
    const connectedProvider = walletHandlers[providerType](provider)
    await toast.promise(
      connectedProvider.then((p) => {
        if (!p?.account) {
          return Promise.reject('Unable to get provider')
        }

        if (p?.isUnlock && p?.email) {
          setStorage('email', p.email)
        } else {
          removeKey('email')
        }
        setStorage('provider', providerType)
      }),
      {
        error:
          'There was an error in connecting with your wallet provider. Please try again.',
        success: 'Successfully connected with wallet provider.',
        loading:
          'Trying to connect with wallet provider. Please approve request on your wallet.',
      }
    )
    return connectedProvider
  }

  return {
    authenticateWithProvider,
  }
}
