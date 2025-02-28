import { createContext } from 'react'

interface AuthenticationContextType {
  account: string | undefined
  setAccount: (account: string | undefined) => void
}

export const AuthenticationContext = createContext<AuthenticationContextType>({
  account: undefined,
  setAccount: () => {},
})

export default AuthenticationContext
