import { useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useAuthenticate } from './useAuthenticate'

interface useEventOrganizerProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEventOrganizer = ({
  checkoutConfig,
}: useEventOrganizerProps) => {
  const web3Service = useWeb3Service()
  const { account } = useAuthenticate()

  return useQuery({
    queryKey: ['eventOrganizer', checkoutConfig, account],
    queryFn: async (): Promise<boolean> => {
      if (!account) {
        return false
      }
      const isManagerByLock = await Promise.all(
        Object.keys(checkoutConfig.config.locks).map((lockAddress: string) =>
          web3Service.isLockManager(
            lockAddress,
            account!,
            (checkoutConfig.config.locks[lockAddress].network ||
              checkoutConfig.config.network)!
          )
        )
      )
      return !!isManagerByLock.find((isManager) => !!isManager)
    },
  })
}
