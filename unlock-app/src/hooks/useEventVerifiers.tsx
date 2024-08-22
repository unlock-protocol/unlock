import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { locksmith } from '~/config/locksmith'

interface useEventVerifiersProps {
  event: any
}
/**
 * Checks if the current user is a verifier for the event
 */
export const useEventVerifiers = ({ event }: useEventVerifiersProps) => {
  const { account } = useAuth()

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
