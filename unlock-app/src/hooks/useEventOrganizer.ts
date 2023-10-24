import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface useEventOrganizerProps {
  event: any
}
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEventOrganizer = ({ event }: useEventOrganizerProps) => {
  const web3Service = useWeb3Service()
  const { account } = useAuth()

  return useQuery(
    ['eventOrganizer', event, account],
    async (): Promise<boolean> => {
      if (!account) {
        return false
      }
      const isManagerByLock = await Promise.all(
        Object.keys(event.locks).map((lockAddress: string) =>
          web3Service.isLockManager(
            lockAddress,
            account!,
            event.locks[lockAddress].network
          )
        )
      )
      return !!isManagerByLock.find((isManager) => !!isManager)
    }
  )
}
