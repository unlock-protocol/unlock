import { useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { graphService } from '~/config/subgraph'

interface useEventAttendeesProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEventAttendees = ({
  checkoutConfig,
}: useEventAttendeesProps) => {
  return useQuery({
    queryKey: ['eventAttendees', checkoutConfig],
    queryFn: async (): Promise<string[]> => {
      // Group locks by network
      const locksByNetwork: { [key: string]: string[] } = {}
      const defaultNetwork = checkoutConfig.config.network
      if (defaultNetwork) {
        locksByNetwork[defaultNetwork] = []
      }
      Object.keys(checkoutConfig.config.locks).forEach((lockAddress) => {
        const lock = checkoutConfig.config.locks[lockAddress]
        if (!lock.network && defaultNetwork) {
          locksByNetwork[defaultNetwork].push(lockAddress)
        } else {
          if (!locksByNetwork[lock.network!]) {
            locksByNetwork[lock.network!] = []
          }
          locksByNetwork[lock.network!].push(lockAddress)
        }
      })
      const eventAttendees: string[] = []
      await Promise.all(
        Object.keys(locksByNetwork).map(async (network: string) => {
          const locks = locksByNetwork[network]
          const keys = await graphService.keys(
            {
              where: {
                lock_in: locks.map((lock) => lock.toLowerCase()),
                expiration_gt: Math.floor(Date.now() / 1000),
              },
              first: 100,
            },
            {
              networks: [network],
            }
          )
          keys.forEach((key) => {
            eventAttendees.push(key.owner)
          })
        })
      )
      return eventAttendees
    },
  })
}
