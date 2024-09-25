import { Button, Placeholder } from '@unlock-protocol/ui'
import { EventCollection } from '@unlock-protocol/unlock-js'
import Link from 'next/link'
import { WrappedAddress } from '~/components/interface/WrappedAddress'
import Image from 'next/image'
import { useEventCollectionApprovals } from '~/hooks/useEventCollectionApprovals'
import { useState } from 'react'

interface ApprovalsProps {
  eventCollection: EventCollection
}

interface UnapprovedEvent {
  slug: string
  name: string
  createdBy: string
  data?: {
    image?: string
    ticket?: {
      event_is_in_person: boolean
    }
  }
}

export const Approvals = ({ eventCollection }: ApprovalsProps) => {
  const {
    unapprovedEvents,
    isLoadingUnapprovedEvents,
    approveEvent,
    removeEvent,
  } = useEventCollectionApprovals(eventCollection.slug!)

  // track loading for approve and remove actions
  const [approvingEvents, setApprovingEvents] = useState<string[]>([])
  const [removingEvents, setRemovingEvents] = useState<string[]>([])

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
      await approveEvent({ eventSlug })
    } finally {
      setApprovingEvents((prev) => prev.filter((slug) => slug !== eventSlug))
    }
  }

  const handleRemove = async (eventSlug: string) => {
    setRemovingEvents((prev) => [...prev, eventSlug])
    try {
      await removeEvent({ eventSlug })
    } finally {
      setRemovingEvents((prev) => prev.filter((slug) => slug !== eventSlug))
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {/* Table Headers */}
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              ></th>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Organizer
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Location
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {unapprovedEvents.map((event: UnapprovedEvent) => (
              <tr key={event.slug}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {event.data?.image ? (
                    <Image
                      src={event.data.image}
                      alt={event.name || 'Event image'}
                      width={50}
                      height={50}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  )}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <span className="font-bold text-base">{event.name}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {event.createdBy ? (
                    <WrappedAddress
                      address={event.createdBy}
                      showExternalLink={false}
                    />
                  ) : (
                    <span className="text-gray-400">Unknown</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {event.data?.ticket?.event_is_in_person
                    ? 'In-Person'
                    : 'Virtual'}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/event/${event.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="small" variant="outlined-primary">
                        View Event
                      </Button>
                    </Link>
                    <Button
                      size="small"
                      variant="outlined-primary"
                      className="border-red-300 text-red-400 hover:border-red-400 hover:text-red-500 hover:bg-red-100"
                      loading={removingEvents.includes(event.slug)}
                      onClick={() => handleRemove(event.slug)}
                    >
                      Reject<span className="sr-only">, {event.name}</span>
                    </Button>
                    <Button
                      size="small"
                      loading={approvingEvents.includes(event.slug)}
                      onClick={() => handleApprove(event.slug)}
                    >
                      Approve<span className="sr-only">, {event.name}</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Section */}
        <nav
          className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{unapprovedEvents.length}</span> of{' '}
              <span className="font-medium">{unapprovedEvents.length}</span>{' '}
              {unapprovedEvents.length > 1 ? 'results' : 'result'}
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end space-x-2">
            <Button variant="outlined-primary" size="tiny" disabled>
              Previous
            </Button>
            <Button variant="outlined-primary" size="tiny" disabled>
              Next
            </Button>
          </div>
        </nav>
      </div>
    </div>
  )
}
