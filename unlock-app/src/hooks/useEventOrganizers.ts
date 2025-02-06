import { useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { SubgraphService } from '@unlock-protocol/unlock-js'

interface useEventOrganizersProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const getEventOrganizers = async (checkoutConfig: {
  id?: string
  config: PaywallConfigType
}) => {
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
/**
 * Check if currently authenticated user is manager for one of the event's locks.
 *
 */
export const useEventOrganizers = ({
  checkoutConfig,
}: useEventOrganizersProps) => {
  return useQuery({
    queryKey: ['eventOrganizers', checkoutConfig],
    queryFn: async (): Promise<string[]> => {
      let organizers: string[] = []
      // Hardcoded event organizers for specific events : /event/hats-friends
      if (checkoutConfig?.id === '1a2543a9-a233-4e19-ab16-b2cbf2df7196') {
        organizers = ['0xe6DEd6460bf4a1ac320997Bed7991166054574De']
      } else {
        organizers = await getEventOrganizers(checkoutConfig)
      }
      return organizers
    },
  })
}
