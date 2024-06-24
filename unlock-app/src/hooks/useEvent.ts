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
  return useQuery(
    ['useEvent', slug],
    async (): Promise<any> => {
      const { data } = await locksmith.getEvent(slug)
      return toFormData(data.data!)
    },
    useQueryProps
  )
}
