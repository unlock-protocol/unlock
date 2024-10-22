import networks from '@unlock-protocol/networks'
import { WalletService } from '@unlock-protocol/unlock-js'
import { createContext, useContext } from 'react'
import { usePrivy } from '@privy-io/react-auth'

interface AuthenticationContextType {
  watchAsset(asset: any): void
  account?: string
  getWalletService(network?: number): Promise<WalletService>
}

export const defaultValues = {
  watchAsset: () => {},
  getWalletService: async (_network?: number) => new WalletService(networks),
}

export const AuthenticationContext =
  createContext<AuthenticationContextType>(defaultValues)

export const useAuth = () => {
  const context = useContext(AuthenticationContext)
  const { ready, authenticated, user } = usePrivy()

  const account = ready && authenticated ? user?.wallet?.address : undefined

  return {
    ...context,
    connected: authenticated,
    account,
  }
}

export default AuthenticationContext
