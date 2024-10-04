import React from 'react'
import { Event } from './EventsCollectionDetailContent'
import ReactMarkdown from 'react-markdown'
import { Button, Drawer, Placeholder } from '@unlock-protocol/ui'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { RegistrationCard } from '../event/Registration/RegistrationCard'
import { useEventOrganizers } from '~/hooks/useEventOrganizers'
import Hosts from '../event/Hosts'
import { EventDetail } from '../event/EventDetail'
import { EventLocation } from '../event/EventLocation'
import dayjs from 'dayjs'
import AddToCalendarButton from '../event/AddToCalendarButton'
import { FaExternalLinkAlt } from 'react-icons/fa'
import Link from 'next/link'
import PastEvent from '../event/Layout/PastEvent'
import RemoveFromCollectionButton from './RemoveFromCollectionButton'
import { getEventAttributes } from '~/utils/eventCollections'
import { useEventOrganizer } from '~/hooks/useEventOrganizer'
import { TbSettings } from 'react-icons/tb'

interface EventDetailDrawerProps {
  collectionSlug: string | undefined
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  event: Event | null
  isManager: boolean
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  collectionSlug,
  isOpen,
  setIsOpen,
  event,
  isManager,
}) => {
  const { data: checkoutConfig, isPending: isCheckoutConfigPending } =
    useCheckoutConfig({
      id: event?.checkoutConfigId,
    })

  const { data: isEventOrganizer } = useEventOrganizer({
    checkoutConfig: checkoutConfig!,
  })

  const { data: organizers } = useEventOrganizers({
    checkoutConfig: checkoutConfig!,
  }) as { data: string[] | undefined }

  if (!event) return null

  const { name, data } = event
  const { image, description } = data

  const {
    startDate: eventStartDate,
    startTime: eventStartTime,
    endDate: eventEndDate,
    endTime,
    timezone,
    address,
  } = getEventAttributes(event)

  const parsedEvent = {
    ...event.data,
    slug: event.slug!,
    ticket: {
      event_start_date: eventStartDate,
      event_end_date: eventEndDate,
      event_start_time: eventStartTime,
      event_end_time: endTime,
      event_timezone: timezone,
      event_address: address,
    },
  }

  const eventDate = dayjs.tz(`${eventStartDate} ${eventStartTime}`, timezone)
  const eventEndDateObj = dayjs.tz(`${eventEndDate} ${endTime}`, timezone)

  const hasPassed = dayjs().isAfter(eventEndDateObj)

  const isSameDay = eventDate.isSame(eventEndDateObj, 'day')

  const startDate = eventDate.format('dddd, MMMM D, YYYY')

  const endDate = !isSameDay
    ? eventEndDateObj.format('dddd, MMMM D, YYYY')
    : null

  const hasLocation = address?.length > 0
  const hasDate = startDate || endDate

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
            <AddToCalendarButton
              event={parsedEvent}
              eventUrl={event.eventUrl}
            />
            <Link href={event.eventUrl} target="_blank">
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

            {/* Location */}
            {hasLocation && <EventLocation event={event.data} compact />}

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
