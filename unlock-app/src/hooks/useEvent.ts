import { useQuery } from '@tanstack/react-query'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { storage } from '~/config/storage'

interface useEventProps {
  slug: string
}
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEvent = ({ slug }: useEventProps, useQueryProps: any) => {
  return useQuery(
    ['useEvent', slug],
    async (): Promise<any> => {
      const { data } = await storage.getEvent(slug)
      return toFormData(data.data!)
    },
    useQueryProps
  )
}
