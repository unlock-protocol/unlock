import { Metadata, getLockTypeByMetadata } from '@unlock-protocol/core'
import { config } from '~/config/app'
import { getMetadata } from '~/hooks/metadata'
import { getLocksByNetwork } from '~/hooks/useLocksByManager'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

const getPastEventsByManager = async (account: string) => {
  const events: Partial<Metadata>[] = []
  await Promise.all(
    Object.keys(config.networks).map(async (network) => {
      try {
        const locks = await getLocksByNetwork({
          account,
          network,
        })
        if (locks.length > 0) {
          return Promise.all(
            locks.map(async (lock) => {
              try {
                const metadata = await getMetadata(lock.address, lock.network)
                const { isEvent } = await getLockTypeByMetadata(metadata)
                if (isEvent) {
                  const eventData = toFormData(metadata!)
                  // Fetch the checkout config for this event
                  const eventDetails = await locksmith.getEvent(eventData.slug!)
                  events.push({
                    ...eventData,
                    lockAddress: lock.address,
                    network: lock.network,
                    checkoutConfig: eventDetails.data.checkoutConfig,
                  })
                }
              } catch (error) {
                console.error(
                  'We could not get the metadata for this lock',
                  lock.address
                )
                console.log(error)
              }
            })
          )
        }
      } catch (error) {
        console.error('We could not retrieve locks from network', { network })
        console.error(error)
      }
    })
  )
  return events
}

export const useUserEvents = (account: string) => {
  return useQuery({
    queryKey: ['userEvents', account],
    queryFn: () => getPastEventsByManager(account),
    enabled: !!account,
  })
}
