import { useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { getLocksByNetwork } from '~/hooks/useLocksByManager'

const getPastEventsByManager = async (account: string) => {
  const events = [
    { name: 'My party', image: '', slug: '', lock: '0x123', network: '' },
  ]
  await Promise.all(
    Object.keys(config.networks).map((network) => {
      const locks = getLocksByNetwork({
        account,
        network,
      })
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
    return <>...</>
  }

  return (
    <ul>
      {events?.map((event) => {
        return <li key={event.name}>{event.name}</li>
      })}
    </ul>
  )
}
