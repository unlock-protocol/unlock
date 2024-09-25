import { useState } from 'react'
import { Placeholder } from '@unlock-protocol/ui'
import { EventCollection } from '@unlock-protocol/unlock-js'
import {
  useEventCollectionEvents,
  useRemoveEventFromCollection,
} from '~/hooks/useEventCollection'
import { PaginationBar } from '~/components/interface/locks/Manage/elements/PaginationBar'
import { EventCard } from '../EventCard'

interface ManageEventsProps {
  eventCollection: EventCollection
}

export const ManageEvents = ({ eventCollection }: ManageEventsProps) => {
  const { data: collectionEvents, isPending: isCollectionEventsPending } =
    useEventCollectionEvents(eventCollection.slug!)

  const { removeEventFromCollection } = useRemoveEventFromCollection(
    eventCollection.slug!
  )

  // Pagination state
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage

  // track loading for remove actions
  const [removingEvents, setRemovingEvents] = useState<string[]>([])

  if (isCollectionEventsPending) {
    return (
      <Placeholder.Root>
        <Placeholder.Card></Placeholder.Card>
      </Placeholder.Root>
    )
  }

  // Guard clause to ensure collectionEvents is an array with at least one element
  if (!Array.isArray(collectionEvents) || collectionEvents.length === 0) {
    return (
      <p className="text-center text-gray-500">
        You are yet to add any events.
      </p>
    )
  }

  const handleRemove = async (eventSlug: string) => {
    setRemovingEvents((prev) => [...prev, eventSlug])
    try {
      await removeEventFromCollection({
        collectionSlug: eventCollection.slug!,
        eventSlug: eventSlug,
      })
    } finally {
      setRemovingEvents((prev) => prev.filter((slug) => slug !== eventSlug))
    }
  }

  const paginatedEvents = collectionEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="space-y-6">
      {paginatedEvents.map((event: any, index: number) => (
        <EventCard
          key={event.slug}
          event={event}
          index={startIndex + index + 1}
          onRemove={handleRemove}
          isRemoving={removingEvents.includes(event.slug)}
        />
      ))}

      {/* pagination */}
      <PaginationBar
        maxNumbersOfPage={Math.ceil(collectionEvents.length / itemsPerPage)}
        setPage={setPage}
        page={page}
      />
    </div>
  )
}
