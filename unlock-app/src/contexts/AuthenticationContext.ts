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
}

export const defaultValues = {
  changeNetwork: () => {},
  signMessage: (_phrase: string) => '',
  authenticate: () => {},
  deAuthenticate: () => {},
  watchAsset: () => {},
}

export const AuthenticationContext =
  createContext<AuthenticationContextType>(defaultValues)

export const useAuth = () => {
  return useContext(AuthenticationContext)
}

export default AuthenticationContext
