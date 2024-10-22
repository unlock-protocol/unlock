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
  const { authenticated, user } = usePrivy()

  return {
    ...context,
    connected: authenticated,
    account: user?.wallet?.address || context.account,
  }
}

export default AuthenticationContext
