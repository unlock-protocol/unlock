import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { locksmith } from '~/config/storage'

interface useEventVerifiersProps {
  event: any
}
/**
 * Checks if the current user is a verifier for the event
 */
export const useEventVerifiers = ({ event }: useEventVerifiersProps) => {
  const { account } = useAuth()

  return useQuery(
    ['getEventVerifiers', event.slug, account],
    async () => {
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
    {
      onError: (err: any) => {
        console.error(
          err?.error ??
            'We could not load the list of verifiers for your lock. Please reload to to try again.'
        )
      },
    }
  )
}
