import { useState } from 'react'
import { Placeholder } from '@unlock-protocol/ui'
import { EventCollection } from '@unlock-protocol/unlock-js'
import { useEventCollectionApprovals } from '~/hooks/useEventCollectionApprovals'
import { PaginationBar } from '~/components/interface/locks/Manage/elements/PaginationBar'
import { EventCard } from '../EventCard'

interface ApprovalsProps {
  eventCollection: EventCollection
}

interface UnapprovedEvent {
  eventUrl: string
  id: number
  name: string
  eventType: string
  data: {
    name: string
    slug: string
    image: string
    ticket: {
      event_address: string
      event_end_date: string
      event_end_time: string
      event_location: string
      event_timezone: string
      event_start_date: string
      event_start_time: string
      event_is_in_person: boolean
    }
    replyTo: string
    attributes: Array<{
      value: string
      trait_type: string
    }>
    description: string
    emailSender: string
    requiresApproval: boolean
  }
  createdBy: string
  createdAt: string
  updatedAt: string
  slug: string
  checkoutConfigId: string
}

export const Approvals = ({ eventCollection }: ApprovalsProps) => {
  const {
    unapprovedEvents,
    isLoadingUnapprovedEvents,
    approveEvent,
    rejectEvent,
  } = useEventCollectionApprovals(eventCollection.slug!)

  // Pagination state
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage

  // Track loading for approve and reject actions
  const [approvingEvents, setApprovingEvents] = useState<string[]>([])
  const [rejectingEvents, setRejectingEvents] = useState<string[]>([])

  // State for notifying past attendees
  const [notifyPastAttendees, setNotifyPastAttendees] = useState(false)

  // Guard clause to ensure eventCollection and slug are defined
  if (!eventCollection || !eventCollection.slug) {
    return <p className="text-center text-red-500">Invalid event collection.</p>
  }

  if (isLoadingUnapprovedEvents) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  // Guard clause to ensure unapprovedEvents is an array with at least one element
  if (
    !unapprovedEvents ||
    !Array.isArray(unapprovedEvents) ||
    unapprovedEvents.length === 0
  ) {
    return (
      <p className="text-center text-gray-500">No event submissions yet.</p>
    )
  }

  const handleApprove = async (eventSlug: string) => {
    setApprovingEvents((prev) => [...prev, eventSlug])
    try {
      await approveEvent({
        collectionSlug: eventCollection.slug!,
        eventSlug,
        notifyPastAttendees, // Pass the notification preference
      })
    } finally {
      setApprovingEvents((prev) => prev.filter((slug) => slug !== eventSlug))
    }
  }

  const handleReject = async (eventSlug: string) => {
    setRejectingEvents((prev) => [...prev, eventSlug])
    try {
      await rejectEvent({ collectionSlug: eventCollection.slug!, eventSlug })
    } finally {
      setRejectingEvents((prev) => prev.filter((slug) => slug !== eventSlug))
    }
  }

  const paginatedEvents = unapprovedEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-100 rounded-lg">
        <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={notifyPastAttendees}
            onChange={(e) => setNotifyPastAttendees(e.target.checked)}
            className="w-4 h-4 text-brand-ui-primary rounded focus:ring-brand-ui-primary"
          />
          <span>Notify past event attendees when approving events</span>
        </label>
        <p className="mt-2 text-sm text-gray-600">
          When checked, an email will be sent to all attendees of past events in
          this collection when you approve a new event.
        </p>
      </div>

      {paginatedEvents.map((event: UnapprovedEvent, index: number) => (
        <EventCard
          key={event.slug}
          event={event}
          index={startIndex + index + 1}
          onApprove={handleApprove}
          onReject={handleReject}
          isApproving={approvingEvents.includes(event.slug)}
          isRejecting={rejectingEvents.includes(event.slug)}
        />
      ))}

      {/* Pagination */}
      <PaginationBar
        maxNumbersOfPage={Math.ceil(unapprovedEvents.length / itemsPerPage)}
        setPage={setPage}
        page={page}
      />
    </div>
  )
}
