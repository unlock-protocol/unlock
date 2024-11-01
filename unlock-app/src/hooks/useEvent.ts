import { useQuery } from '@tanstack/react-query'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { locksmith } from '~/config/locksmith'

interface useEventProps {
  slug: string
}
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEvent = ({ slug }: useEventProps, useQueryProps = {}) => {
  return useQuery({
    queryKey: ['useEvent', slug],
    queryFn: async (): Promise<any> => {
      try {
        const { data } = await locksmith.getEvent(slug)
        if (!data || !data.data) {
          throw new Error('Event not found')
        }
        return toFormData(data.data)
      } catch (error: any) {
        // Propagate the original error object
        if (error.response && error.response.status === 404) {
          error.message = 'Event not found'
        }
        throw error
      }
    },
    ...useQueryProps,
  })
}
