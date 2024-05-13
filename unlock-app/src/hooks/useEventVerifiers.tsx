import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { storage } from '~/config/storage'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface useEventVerifiersProps {
  event: any
}
/**
 * Checks if the current user is a verifier for the event
 */
export const useEventVerifiers = ({ event }: useEventVerifiersProps) => {
  const { account } = useAuth()

  return useQuery(
    ['getEventVerifiers', event.slug],
    async () => {
      const response = await storage.eventVerifier(event.slug, account!)
      return response.status === 200
    },
    {
      onError: (err: any) => {
        ToastHelper.error(
          err?.error ??
            'We could not load the list of verifiers for your lock. Please reload to to try again.'
        )
      },
    }
  )
}
