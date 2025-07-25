'use client'

import { Placeholder } from '@unlock-protocol/ui'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useUserEventCollections } from '../../../../../hooks/useUserEventCollections'
import { EventCollectionCard } from '../../../../content/events-collection/EventCollectionCard'

export const EventCollectionList = () => {
  const { account } = useAuthenticate()

  const {
    data: userEventCollections,
    isPending: isLoadingUserEventCollections,
  } = useUserEventCollections(account!)

  if (!account) {
    return <WalletNotConnected />
  }

  if (isLoadingUserEventCollections || !userEventCollections) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  // Ensure userEventCollections is an array before checking length and mapping
  const eventCollections = Array.isArray(userEventCollections)
    ? userEventCollections
    : []

  return (
    <>
      {eventCollections.length > 0 ? (
        eventCollections.map((eventCollection: any) => (
          <EventCollectionCard
            key={eventCollection.slug}
            eventCollection={eventCollection}
          />
        ))
      ) : (
        <p>No event collections found.</p>
      )}
    </>
  )
}

export default EventCollectionList
