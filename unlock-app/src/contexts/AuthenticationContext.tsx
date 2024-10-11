import networks from '@unlock-protocol/networks'
import { WalletService } from '@unlock-protocol/unlock-js'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

interface AuthenticationContextType {
  authenticate(provider: any): void
  deAuthenticate(): void
  watchAsset(asset: any): void
  account?: string
  network?: number
  email?: string
  connected?: boolean
  encryptedPrivateKey?: any
  isUnlockAccount?: boolean
  getWalletService(network?: number): Promise<WalletService>
  providerSend(method: string, params: string[]): void
  displayAccount?: string
  accessToken: string | null
}

export const defaultValues = {
  authenticate: () => {},
  deAuthenticate: () => {},
  watchAsset: () => {},
  providerSend: (_method: string, _params: string[]) => {},
  getWalletService: async (_network?: number) => new WalletService(networks),
  accessToken: null,
}

export const AuthenticationContext =
  createContext<AuthenticationContextType>(defaultValues)

export const useAuth = () => {
  const context = useContext(AuthenticationContext)
  const {
    authenticated,
    user,
    getAccessToken: privyGetAccessToken,
  } = usePrivy()
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccessToken = async () => {
      if (authenticated) {
        const token = await privyGetAccessToken()
        setAccessToken(token)
      }
    }
    fetchAccessToken()
  }, [authenticated, privyGetAccessToken])

  return {
    ...context,
    connected: authenticated,
    account: user?.wallet?.address || context.account,
    accessToken,
  }
}

export default AuthenticationContext
