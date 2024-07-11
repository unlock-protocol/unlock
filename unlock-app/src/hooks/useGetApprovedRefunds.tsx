import { Event } from '@unlock-protocol/core'
import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

export const useGetApprovedRefunds = (event: Event) => {
  return useQuery(['getRefunds', event.slug], async () => {
    const response = await locksmith.approvedRefunds(event.slug)
    return response.data
  })
}
