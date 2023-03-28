import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { AxiosError } from 'axios'
import { getAccessToken, getCurrentAccount } from '~/utils/session'
import { ReactNode, createContext, useContext } from 'react'

export const useSessionUser = () => {
  return useQuery(
    ['session'],
    async () => {
      try {
        const response = await storage.user()
        return response.data!.walletAddress
      } catch (error) {
        const address = getCurrentAccount()
        if (error instanceof AxiosError) {
          if (error.response?.status === 401 && address) {
            return null
          }
        }
        if (address && getAccessToken(address)) {
          return address
        }
        return null
      }
    },
    {
      staleTime: 60 * 10 * 1000,
      refetchInterval: 60 * 10 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  )
}

interface SessionContextType {
  session?: string | null
  refetchSession: () => Promise<UseQueryResult<string | null | undefined>>
}

export const SessionContext = createContext<SessionContextType>({
  session: null,
  refetchSession: async () => {
    throw new Error('Session context not initialized')
  },
})

interface Props {
  children: ReactNode
}

export const SessionProvider = ({ children }: Props) => {
  const { data: session, refetch } = useSessionUser()
  return (
    <SessionContext.Provider value={{ session, refetchSession: refetch }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  return useContext(SessionContext)
}
