import networks from '@unlock-protocol/networks'
import { WalletService } from '@unlock-protocol/unlock-js'
import { createContext, useContext } from 'react'
import { usePrivy } from '@privy-io/react-auth'

interface AuthenticationContextType {
  authenticate(provider: any): void
  watchAsset(asset: any): void
  account?: string
  network?: number
  email?: string
  connected?: boolean | string | undefined
  encryptedPrivateKey?: any
  isUnlockAccount?: boolean
  getWalletService(network?: number): Promise<WalletService>
  providerSend(method: string, params: string[]): void
  displayAccount?: string
}

export const defaultValues = {
  authenticate: () => {},
  watchAsset: () => {},
  providerSend: (_method: string, _params: string[]) => {},
  getWalletService: async (_network?: number) => new WalletService(networks),
}

export const AuthenticationContext =
  createContext<AuthenticationContextType>(defaultValues)

export const useAuth = () => {
  const context = useContext(AuthenticationContext)
  const { authenticated, user } = usePrivy()

  return {
    ...context,
    connected: authenticated,
    account: user?.wallet?.address || context.account,
  }
}

export default AuthenticationContext
