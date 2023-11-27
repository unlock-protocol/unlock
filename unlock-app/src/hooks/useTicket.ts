import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

export const useLocksmithGranterAddress = () => {
  const query = useQuery(
    ['keyGranters'],
    async () => {
      const response = await storage.balance()
      return response.data[1].address!
    },
    {
      staleTime: 86400,
      refetchInterval: 86400,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: 3,
    }
  )
  return query
}

interface TicketOptions {
  lockAddress: string
  keyId: string
  network: number
}

export const useTicket = ({ lockAddress, keyId, network }: TicketOptions) => {
  const query = useQuery(
    ['ticket', network, lockAddress, keyId],
    async () => {
      const response = await storage.getTicket(network, lockAddress, keyId)
      return response.data
    },
    {
      staleTime: 86400,
      refetchInterval: 86400,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  )
  return query
}
