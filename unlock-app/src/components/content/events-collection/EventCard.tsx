import { Button, Collapse, Detail } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useState } from 'react'
import { WrappedAddress } from '~/components/interface/WrappedAddress'

export interface EventCardProps {
  index: number
  event: {
    eventUrl: string
    id: number
    name: string
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
  onRemove?: (eventSlug: string) => void
  onApprove?: (eventSlug: string) => void
  onReject?: (eventSlug: string) => void
  isRemoving?: boolean
  isApproving?: boolean
  isRejecting?: boolean
}

export const EventCard = ({
  index,
  event,
  onRemove,
  onApprove,
  onReject,
  isRemoving = false,
  isApproving = false,
  isRejecting = false,
}: EventCardProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const {
    name,
    slug,
    createdBy,
    data: { replyTo },
  } = event

  const EventInfoDefault = () => {
    return (
      <div className="flex md:flex-row flex-col gap-4 w-full">
        <Detail label="#" valueSize="medium" className="w-8">
          {index}
        </Detail>

        <Detail label="Name" valueSize="medium" className="grow md:w-1/4">
          {name}
        </Detail>

        <Detail label="Organizer" valueSize="medium" className="grow">
          <WrappedAddress
            address={createdBy}
            showCopyIcon={true}
            showExternalLink={false}
          />
        </Detail>

        <div className="flex justify-end space-x-5 py-5">
          <Button size="small" variant="outlined-primary" target="_blank">
            <Link href={`/event/${slug}`} target="_blank">
              View Event
            </Link>
          </Button>

          {/* Conditionally render Remove button if onRemove is provided */}
          {onRemove && (
            <Button
              size="small"
              variant="outlined-primary"
              className="border-red-300 text-red-400 hover:border-red-400 hover:text-red-500 hover:bg-red-100"
              onClick={() => onRemove(slug)}
              loading={isRemoving}
            >
              Remove
              <span className="sr-only">, {name}</span>
            </Button>
          )}

          {/* Conditionally render Reject button if onReject is provided */}
          {onReject && (
            <Button
              size="small"
              variant="outlined-primary"
              className="border-red-300 text-red-400 hover:border-red-400 hover:text-red-500 hover:bg-red-100"
              onClick={() => onReject(slug)}
              loading={isRejecting}
            >
              Reject
              <span className="sr-only">, {name}</span>
            </Button>
          )}

          {/* Conditionally render Approve button if onApprove is provided */}
          {onApprove && (
            <Button
              size="small"
              variant="outlined-primary"
              onClick={() => onApprove(slug)}
              loading={isApproving}
            >
              Approve
              <span className="sr-only">, {name}</span>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Collapse
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      disabled={false}
      content={<EventInfoDefault />}
    >
      <div className="flex flex-col divide-y divide-gray-400">
        <Detail
          label={
            <div className="flex items-center w-full gap-2">
              <span>Organizer Email:</span>
              <span className="block text-base font-semibold text-black">
                {replyTo}
              </span>
              <Button size="tiny" variant="outlined-primary" disabled>
                Send email
              </Button>
            </div>
          }
          className="py-2"
        />
      </div>
    </Collapse>
  )
}
