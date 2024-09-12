import { Event } from '@unlock-protocol/core'
import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

export const useGetApprovedRefunds = (event: Event) => {
  return useQuery({
    queryKey: ['getRefunds', event.slug],
    queryFn: async () => {
      const response = await locksmith.approvedRefunds(event.slug)
      return response.data
    },
  })
}
