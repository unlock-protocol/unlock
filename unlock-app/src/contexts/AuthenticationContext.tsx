import networks from '@unlock-protocol/networks'
import { WalletService } from '@unlock-protocol/unlock-js'
import { createContext, useContext } from 'react'

interface AuthenticationContextType {
  changeNetwork(network: any): Promise<unknown>
  signMessage(phrase: string): string
  authenticate(provider: any): void
  deAuthenticate(): void
  watchAsset(asset: any): void
  account?: string
  network?: number
  email?: string
  encryptedPrivateKey?: any
  isUnlockAccount?: boolean
  getWalletService(network?: number): Promise<WalletService>
  providerSend(method: string, params: string[]): void
}

export const defaultValues = {
  changeNetwork: async () => {},
  signMessage: (_phrase: string) => '',
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
