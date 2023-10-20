import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface useEventOrganizerProps {
  eventData: any
}
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEventOrganizer = ({ eventData }: useEventOrganizerProps) => {
  const web3Service = useWeb3Service()
  const { account } = useAuth()
  const isOrganizer = true

  return {
    isOrganizer,
    // isLoading,
  }
}
