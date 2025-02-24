import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Button, Drawer, Placeholder } from '@unlock-protocol/ui'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { RegistrationCard } from '../event/Registration/RegistrationCard'
import { useEventOrganizers } from '~/hooks/useEventOrganizers'
import Hosts from '../event/Hosts'
import { EventDetail } from '../event/EventDetail'
import { EventLocation } from '../event/EventLocation'
import AddToCalendarButton from '../event/AddToCalendarButton'
import { FaExternalLinkAlt } from 'react-icons/fa'
import Link from 'next/link'
import PastEvent from '../event/Layout/PastEvent'
import RemoveFromCollectionButton from './RemoveFromCollectionButton'
import { useEventOrganizer } from '~/hooks/useEventOrganizer'
import { TbSettings } from 'react-icons/tb'
import { useEvent } from '~/hooks/useEvent'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { Event } from '@unlock-protocol/core'
import { getEventUrl } from '../event/utils'
import { formatEventDates } from '~/utils/formatEventDates'

interface EventDetailDrawerProps {
  collectionSlug: string | undefined
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  selectedEvent: any
  isManager: boolean
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  collectionSlug,
  isOpen,
  setIsOpen,
  selectedEvent,
  isManager,
}) => {
  const { data: checkoutConfig, isPending: isCheckoutConfigPending } =
    useCheckoutConfig({
      id: selectedEvent?.checkoutConfigId,
    })
  const { data: eventDetails } = useEvent({
    slug: selectedEvent?.slug,
  })

  // transform the event details into an event object
  const event = toFormData({
    ...eventDetails!,
    slug: selectedEvent?.slug,
  }) as Event

  const eventUrl = getEventUrl({
    event,
  })

  const { data: isEventOrganizer } = useEventOrganizer({
    checkoutConfig: checkoutConfig!,
  })

  const { data: organizers } = useEventOrganizers({
    checkoutConfig: checkoutConfig!,
  }) as { data: string[] | undefined }

  if (!event) return null

  const { name, image, description } = event

  // Format the event dates and get boolean flags
  const {
    startDate,
    startTime,
    endDate,
    endTime,
    hasDate,
    hasLocation,
    hasPassed,
  } = formatEventDates(event.ticket)

  // close drawer when the event is removed
  const handleEventRemove = () => {
    setIsOpen(false)
  }

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
      {event && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-end gap-2 md:gap-4 px-4 md:px-0">
            {isEventOrganizer && (
              <Link
                target="_blank"
                href={`/event/${event.slug}/settings`}
                className="w-full md:w-auto"
              >
                <Button variant="primary" className="w-full">
                  <div className="flex items-center gap-2 justify-center">
                    <TbSettings />
                    <span>Settings</span>
                  </div>
                </Button>
              </Link>
            )}
            {isManager && (
              <RemoveFromCollectionButton
                collectionSlug={collectionSlug}
                eventSlug={event.slug!}
                onRemove={handleEventRemove}
              />
            )}
          </div>

          {/* Event Image */}
          <img
            src={image}
            alt={name}
            className="w-full h-[500px] object-cover rounded-2xl"
          />

          <div className="flex items-center justify-end gap-0 mt-auto md:gap-2">
            <AddToCalendarButton event={event} eventUrl={eventUrl} />
            <Link href={eventUrl} target="_blank">
              <Button variant="borderless-primary">
                <FaExternalLinkAlt size={20} width={1} className="mr-2" />
              </Button>
            </Link>
          </div>

          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="text-xl text-brand-ui-primary font-semibold">
              {name}
            </h3>

            {organizers && organizers.length > 0 && (
              <Hosts organizers={organizers} />
            )}

            {/* Date */}
            {hasDate && (
              <EventDetail compact label="Date" icon={CalendarIcon}>
                <div className="flex flex-col text-sm font-normal text-brand-dark">
                  <span>{startDate}</span>
                  {startTime && <span>{startTime}</span>}
                  {endDate && (
                    <>
                      <span>to</span>
                      <span>{endDate}</span>
                    </>
                  )}
                  {endTime && <span>{endTime}</span>}
                </div>
              </EventDetail>
            )}

            {/* Location */}
            {hasLocation && <EventLocation event={event} compact />}

            {isCheckoutConfigPending ? (
              <Placeholder.Root>
                <Placeholder.Card />
              </Placeholder.Root>
            ) : !hasPassed ? (
              <RegistrationCard
                requiresApproval={event.requiresApproval}
                checkoutConfig={checkoutConfig!}
                hideRemaining={!!event.hideRemaining}
              />
            ) : (
              <PastEvent
                event={eventDetails!}
                checkoutConfig={checkoutConfig!}
              />
            )}

            {/* Event Details */}
            <div className="mt-10">
              <h3 className="text-base font-bold text-brand-ui-primary">
                About Event
              </h3>
              <hr className="my-2" />
              <div className="mt-4 markdown">
                <ReactMarkdown children={description} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
