import { useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { SubgraphService } from '@unlock-protocol/unlock-js'

interface useEventOrganizersProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEventOrganizers = ({
  checkoutConfig,
}: useEventOrganizersProps) => {
  return useQuery(
    ['eventOrganizers', checkoutConfig],
    async (): Promise<string[]> => {
      const service = new SubgraphService()
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
      const eventOrganizers: string[] = []
      await Promise.all(
        Object.keys(locksByNetwork).map(async (network: string) => {
          const locks = locksByNetwork[network]
          const locksWithManagers = await service.locks(
            {
              first: locks.length,
              where: {
                address_in: locks,
              },
            },
            {
              networks: [network],
            }
          )
          locksWithManagers.forEach((lock) => {
            lock.lockManagers.forEach((manager: string) => {
              if (eventOrganizers.indexOf(manager) == -1) {
                eventOrganizers.push(manager)
              }
            })
          })
        })
      )
      return eventOrganizers
    }
  )
}
