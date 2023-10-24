import { useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface useEventOrganizerProps {
  checkoutConfig: PaywallConfigType
}
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEventOrganizer = ({
  checkoutConfig,
}: useEventOrganizerProps) => {
  const web3Service = useWeb3Service()
  const { account } = useAuth()

  return useQuery(
    ['eventOrganizer', checkoutConfig, account],
    async (): Promise<boolean> => {
      if (!account) {
        return false
      }
      const isManagerByLock = await Promise.all(
        Object.keys(checkoutConfig.locks).map((lockAddress: string) =>
          web3Service.isLockManager(
            lockAddress,
            account!,
            checkoutConfig.locks[lockAddress].network
          )
        )
      )
      return !!isManagerByLock.find((isManager) => !!isManager)
    }
  )
}
