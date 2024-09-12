import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { AxiosError } from 'axios'
import { getAccessToken, getCurrentAccount } from '~/utils/session'
import { ReactNode, createContext, useContext } from 'react'

export const useSessionUser = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const accessToken = getAccessToken()
      const address = getCurrentAccount()
      try {
        if (!accessToken) return ''
        const response = await locksmith.user()
        return response.data!.walletAddress || ''
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401 && accessToken) {
            return ''
          }
          // To handle temporary network errors and fallback if locksmith is not behaving correctly
          if (accessToken) {
            return address
          }
          return ''
        }
      }
    },
    staleTime: 60 * 10 * 1000,
    refetchInterval: 60 * 10 * 1000,
    retry: 3,
    retryDelay: 1000,
  })
}

interface SessionContextType {
  isLoading: boolean
  session?: string
  refetchSession: () => Promise<UseQueryResult<string | null | undefined>>
}

export const SessionContext = createContext<SessionContextType>({
  session: undefined,
  isLoading: false,
  refetchSession: async () => {
    throw new Error('Session context not initialized')
  },
})

interface Props {
  children: ReactNode
}

export const SessionProvider = ({ children }: Props) => {
  const { data: session, refetch, isLoading } = useSessionUser()
  return (
    <SessionContext.Provider
      value={{ session, refetchSession: refetch, isLoading }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  return useContext(SessionContext)
}
