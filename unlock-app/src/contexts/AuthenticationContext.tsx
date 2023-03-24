import networks from '@unlock-protocol/networks'
import { WalletService } from '@unlock-protocol/unlock-js'
import { createContext, useContext } from 'react'

interface AuthenticationContextType {
  authenticate(provider: any): void
  deAuthenticate(): void
  watchAsset(asset: any): void
  account?: string
  network?: number
  email?: string
  connected?: string
  encryptedPrivateKey?: any
  isUnlockAccount?: boolean
  getWalletService(network?: number): Promise<WalletService>
  providerSend(method: string, params: string[]): void
  displayAccount?: string
}

export const defaultValues = {
  authenticate: () => {},
  deAuthenticate: () => {},
  watchAsset: () => {},
  providerSend: (_method: string, _params: string[]) => {},
  getWalletService: async (_network?: number) => new WalletService(networks),
}

export const AuthenticationContext =
  createContext<AuthenticationContextType>(defaultValues)

export const useAuth = () => {
  return useContext(AuthenticationContext)
}

export default AuthenticationContext
