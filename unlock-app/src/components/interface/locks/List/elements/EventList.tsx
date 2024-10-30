'use client'

import { Placeholder } from '@unlock-protocol/ui'
import { useUserEvents } from '~/hooks/useUserEvents'
import { EventCard } from './EventCard'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export const EventList = () => {
  const { account } = useAuthenticate()
  const { data: userEvents, isPending: isLoadingUserEvents } = useUserEvents(
    account!
  )

  // prune out the "ticket for" prefix from the event name
  const prunedEvents =
    userEvents?.map((event) => ({
      ...event,
      name: event?.name?.replace(/^ticket for\s+/i, ''),
    })) || []

  if (!account || isLoadingUserEvents) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  return (
    <>
      {!account ? (
        <WalletNotConnected />
      ) : (
        prunedEvents.map((event: any) => (
          <EventCard key={event.slug} event={event} />
        ))
      )}
    </>
  )
}

export default EventList
