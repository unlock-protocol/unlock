import { createContext, useContext } from 'react'

interface AuthenticationContextType {
  changeNetwork: (network: any) => void
  signMessage: (phrase: string) => string
  authenticate: (provider: any) => void
  deAuthenticate: () => void
  watchAsset: (asset: any) => void
  account?: string
  network?: number
  email?: string
  encryptedPrivateKey?: any
  isUnlockAccount?: boolean
  providerSend: (method: string, params: string[]) => void
}

export const defaultValues = {
  changeNetwork: () => {},
  signMessage: (_phrase: string) => '',
  authenticate: () => {},
  deAuthenticate: () => {},
  watchAsset: () => {},
  providerSend: (_method: string, _params: string[]) => {},
}

export const AuthenticationContext =
  createContext<AuthenticationContextType>(defaultValues)

export const useAuth = () => {
  return useContext(AuthenticationContext)
}

export default AuthenticationContext
