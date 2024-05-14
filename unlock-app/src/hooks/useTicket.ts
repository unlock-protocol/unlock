import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { Event } from '@unlock-protocol/core'

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

interface LockTicketOptions {
  lockAddress: string
  keyId: string
  network: number
}

export const useLockTicket = ({
  lockAddress,
  keyId,
  network,
}: LockTicketOptions) => {
  const query = useQuery(
    ['ticket', network, lockAddress, keyId],
    async () => {
      const response = await storage.getLockTicket(network, lockAddress, keyId)
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

interface EventTicketOptions {
  lockAddress: string
  keyId: string
  network: number
  eventProp: Event
}

export const useEventTicket = ({
  lockAddress,
  keyId,
  network,
  eventProp,
}: EventTicketOptions) => {
  const query = useQuery(
    ['ticket', network, lockAddress, keyId],
    async () => {
      const response = await storage.getEventTicket(
        network,
        lockAddress,
        eventProp.slug,
        keyId
      )
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
