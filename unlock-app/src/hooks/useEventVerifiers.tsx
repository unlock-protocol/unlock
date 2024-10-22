import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { useAuthenticate } from './useAuthenticate'

interface useEventVerifiersProps {
  event: any
}
/**
 * Checks if the current user is a verifier for the event
 */
export const useEventVerifiers = ({ event }: useEventVerifiersProps) => {
  const { account } = useAuthenticate()

  return useQuery({
    queryKey: ['getEventVerifiers', event.slug, account],
    queryFn: async () => {
      if (!account) {
        return false
      }
      const response = await locksmith.eventVerifiers(event.slug)
      let isVerifier = false
      response.data.results?.forEach((item) => {
        if (item.address.toLowerCase() === account.toLowerCase()) {
          isVerifier = true
          return true
        }
      })
      return isVerifier
    },
  })
}
