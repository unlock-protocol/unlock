import React from 'react'
import { Event } from './EventsCollectionDetailContent'
import ReactMarkdown from 'react-markdown'
import { Button, Drawer, Placeholder } from '@unlock-protocol/ui'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { AiOutlineClockCircle as ClockIcon } from 'react-icons/ai'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { RegistrationCard } from '../event/Registration/RegistrationCard'
import { useEventOrganizers } from '~/hooks/useEventOrganizers'
import Hosts from '../event/Hosts'
import { EventDetail } from '../event/EventDetail'
import { EventLocation } from '../event/EventLocation'
import dayjs from 'dayjs'
import { getEventDate, getEventEndDate } from '../event/utils'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import AddToCalendarButton from '../event/AddToCalendarButton'
import { FaExternalLinkAlt } from 'react-icons/fa'
import Link from 'next/link'
import PastEvent from '../event/Layout/PastEvent'
import { language } from '~/utils/eventCollections'
import RemoveFromCollectionButton from './RemoveFromCollectionButton'

interface EventDetailDrawerProps {
  collectionSlug: string | undefined
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  event: Event | null
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  collectionSlug,
  isOpen,
  setIsOpen,
  event,
}) => {
  const { data: checkoutConfig, isPending: isCheckoutConfigPending } =
    useCheckoutConfig({
      id: event?.checkoutConfigId,
    })

  const { data: organizers } = useEventOrganizers({
    checkoutConfig: checkoutConfig!,
  }) as { data: string[] | undefined }

  if (!event) return null

  const { name, data } = event
  const { image, description } = data

  const parsedEvent = toFormData({
    ...event.data,
    slug: event.slug!,
  })
  const eventDate = getEventDate(parsedEvent?.ticket)
  const eventEndDate = getEventEndDate(parsedEvent?.ticket)

  const hasPassed = eventEndDate
    ? dayjs().isAfter(eventEndDate)
    : dayjs().isAfter(eventDate)

  const isSameDay = dayjs(eventDate).isSame(eventEndDate, 'day')

  const startDate = eventDate
    ? eventDate.toLocaleDateString(undefined, {
        timeZone: parsedEvent?.ticket?.event_timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const startTime =
    eventDate && parsedEvent?.ticket?.event_start_time
      ? eventDate.toLocaleTimeString(language(), {
          timeZone: parsedEvent?.ticket?.event_timezone,
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      : undefined

  const endDate =
    eventEndDate && eventEndDate && !isSameDay
      ? eventEndDate.toLocaleDateString(undefined, {
          timeZone: parsedEvent?.ticket?.event_timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null

  const endTime =
    eventDate &&
    parsedEvent?.ticket?.event_end_time &&
    eventEndDate &&
    isSameDay
      ? eventEndDate.toLocaleTimeString(language(), {
          timeZone: parsedEvent?.ticket?.event_timezone,
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      : null

  const hasLocation = (parsedEvent?.ticket?.event_address || '')?.length > 0
  const hasDate = startDate || startTime || endDate || endTime

  // close drawer when the event is removed
  const handleEventRemove = () => {
    setIsOpen(false)
  }

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
      {event && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <RemoveFromCollectionButton
              collectionSlug={collectionSlug}
              eventSlug={event.slug!}
              onRemove={handleEventRemove}
            />
          </div>
          {/* Event Image */}
          <img
            src={image}
            alt={name}
            className="w-full h-[500px] object-cover rounded-2xl"
          />

          <div className="flex items-center justify-end gap-0 mt-auto md:gap-2">
            <AddToCalendarButton
              event={parsedEvent}
              eventUrl={event.eventUrl}
            />
            <Button variant="borderless-primary">
              <Link href={event.eventUrl} target="_blank">
                <FaExternalLinkAlt size={20} width={1} className="mr-2" />
              </Link>
            </Button>
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
            {hasDate && startTime && (
              <EventDetail compact label="Date" icon={CalendarIcon}>
                <div
                  style={{ color: `#${event.background_color}` }}
                  className="flex flex-col text-sm font-normal text-brand-dark"
                >
                  {startDate && endDate && (
                    <span>{dayjs(startDate).format('dddd D MMM YYYY')}</span>
                  )}
                </div>
              </EventDetail>
            )}

            {/* Time */}
            {startTime && (
              <EventDetail compact label="Time" icon={ClockIcon}>
                <div className="flex flex-col text-sm font-normal text-brand-dark">
                  <span>{startTime}</span>
                </div>
              </EventDetail>
            )}

            {/* Location */}
            {hasLocation && <EventLocation event={parsedEvent} compact />}

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
                // @ts-ignore
                event={parsedEvent!}
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
