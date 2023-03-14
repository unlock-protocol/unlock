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
  isConnected: boolean
  encryptedPrivateKey?: any
  isUnlockAccount?: boolean
  getWalletService(network?: number): Promise<WalletService>
  providerSend(method: string, params: string[]): void
  openConnectModal: boolean
  setOpenConnectModal: (open: boolean) => void
}

export const defaultValues = {
  authenticate: () => {},
  deAuthenticate: () => {},
  watchAsset: () => {},
  providerSend: (_method: string, _params: string[]) => {},
  getWalletService: async (_network?: number) => new WalletService(networks),
  openConnectModal: false,
  setOpenConnectModal: (_open: boolean) => {},
  isConnected: false,
}

export const AuthenticationContext =
  createContext<AuthenticationContextType>(defaultValues)

export const useAuth = () => {
  return useContext(AuthenticationContext)
}

export default AuthenticationContext
