import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { storage } from '~/config/storage'

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
      const response = await storage.eventVerifier(event.slug)
      console.log(response.data.results)
      let isVerifier = false
      response.data.results.forEach((item) => {
        console.log(item)
        if (item.address.toLowerCase() === account.toLowerCase()) {
          console.log('true')
          isVerifier = true
          return isVerifier
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
