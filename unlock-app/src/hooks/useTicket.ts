import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { Event } from '@unlock-protocol/core'

export const useLocksmithGranterAddress = () => {
  const query = useQuery({
    queryKey: ['keyGranters'],
    queryFn: async () => {
      const response = await locksmith.balance()
      return response.data[1].address!
    },
    staleTime: 86400,
    refetchInterval: 86400,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 3,
  })
  return query
}

interface EventTicketOptions {
  lockAddress: string
  keyId: string
  network: number
  eventProp?: Event
}

export const useEventTicket = ({
  lockAddress,
  keyId,
  network,
  eventProp,
}: EventTicketOptions) => {
  const query = useQuery({
    queryKey: ['ticket', network, lockAddress, keyId],
    queryFn: async () => {
      if (!eventProp) {
        const response = await locksmith.getTicket(network, lockAddress, keyId)
        return response.data
      } else {
        const response = await locksmith.getEventTicket(
          eventProp.slug,
          network,
          lockAddress,
          keyId
        )
        return response.data
      }
    },
    staleTime: 86400,
    refetchInterval: 86400,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
  return query
}
