import { useQuery } from '@tanstack/react-query'
import { Metadata, getLockTypeByMetadata } from '@unlock-protocol/core'
import Image from 'next/image'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { config } from '~/config/app'
import { getMetadata } from '~/hooks/metadata'
import { getLocksByNetwork } from '~/hooks/useLocksByManager'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import Link from 'next/link'
import { getEventPath } from './utils'
import { Button } from '@unlock-protocol/ui'

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
                // TODO: replace with a method to get the event data from a lock
                // especially once we have an "event" object
                const metadata = await getMetadata(lock.address, lock.network)
                const { isEvent } = await getLockTypeByMetadata(metadata)
                if (isEvent) {
                  const eventData = toFormData(metadata!)
                  events.push({
                    ...eventData,
                    lockAddress: lock.address,
                    network: lock.network,
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

interface PastEventsByManagerProps {
  manager: string
}

export const PastEventsByManager = ({ manager }: PastEventsByManagerProps) => {
  const { isLoading, data: events } = useQuery(['events', manager], () =>
    getPastEventsByManager(manager)
  )
  if (isLoading) {
    return null
  }

  return (
    <>
      <h2 className="text-3xl font-semibold mb-4">Your organized events</h2>
      <ul className="flex flex-wrap gap-4 ">
        {events?.map((event) => {
          console.log(event)
          return (
            <li
              className="flex gap-4 p-2 w-full md:w-64 rounded-lg bg-white"
              key={event.name}
            >
              <div className="w-36">
                <Image
                  alt={event.name || 'My event'}
                  src={event.image || ''}
                  width="100"
                  height="100"
                />
              </div>
              <div className="w-full flex flex-col justify-between">
                <p>{event.name}</p>
                <Button
                  as={Link}
                  href={getEventPath({
                    lockAddress: event.lockAddress,
                    network: event.network,
                    metadata: {
                      slug: event.slug,
                    },
                  })}
                  className="mx-auto flex"
                  size="small"
                  variant="borderless"
                  iconRight={<ExternalLinkIcon size={16} />}
                >
                  Manage
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
