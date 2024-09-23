import React from 'react'
import { Event } from './EventsCollectionDetailContent'
import { Drawer, Placeholder } from '@unlock-protocol/ui'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { AiOutlineGlobal as GlobeIcon } from 'react-icons/ai'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { RegistrationCard } from '../event/Registration/RegistrationCard'
import { useEventOrganizers } from '~/hooks/useEventOrganizers'
import Hosts from '../event/Hosts'
import { EventDetail } from '../event/EventDetail'
import { EventLocation } from '../event/EventLocation'
import dayjs from 'dayjs'

interface EventDetailDrawerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  event: Event | null
}

// Helper function to get ordinal suffix for a given day
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

// util to format date range
const formatDateRange = (startDateStr: string, endDateStr?: string): string => {
  const startDate = dayjs(startDateStr)
  const endDate = endDateStr ? dayjs(endDateStr) : null

  const startDay = startDate.date()
  const startSuffix = getOrdinalSuffix(startDay)
  const startMonth = startDate.format('MMM')
  const startYear = startDate.year()

  if (endDate) {
    const endDay = endDate.date()
    const endSuffix = getOrdinalSuffix(endDay)
    const endMonth = endDate.format('MMM')
    const endYear = endDate.year()

    // If start and end are in the same month and year
    if (
      startDate.isSame(endDate, 'month') &&
      startDate.isSame(endDate, 'year')
    ) {
      return `${startDay}${startSuffix} ${startMonth} to ${endDay}${endSuffix} ${endMonth}, ${startYear}`
    }

    // If start and end are in different months but same year
    if (startDate.isSame(endDate, 'year')) {
      return `${startDay}${startSuffix} ${startMonth} to ${endDay}${endSuffix} ${endMonth}, ${startYear}`
    }

    // If start and end are in different years
    return `${startDay}${startSuffix} ${startMonth}, ${startYear} to ${endDay}${endSuffix} ${endMonth}, ${endYear}`
  }

  // If only start date is available
  return `${startDay}${startSuffix} ${startMonth}, ${startYear}`
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  isOpen,
  setIsOpen,
  event,
}) => {
  const { data: checkoutConfig, isPending } = useCheckoutConfig({
    id: event?.checkoutConfigId,
  })
  const { data: organizers } = useEventOrganizers({
    checkoutConfig: checkoutConfig!,
  }) as { data: string[] | undefined }

  if (!event) return null

  const { name, data } = event
  const { image, ticket, description, requiresApproval } = data

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="space-y-4">
        {/* Event Image */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-2xl"
        />

        {/* Event Information */}
        <div className="space-y-4">
          <h3 className="text-xl text-brand-ui-primary font-semibold">
            {name}
          </h3>

          {organizers && organizers.length > 0 && (
            <Hosts organizers={organizers} />
          )}

          {/* Date Details */}
          <EventDetail compact label="Date" icon={CalendarIcon}>
            <div
              // @ts-expect-error property 'background_color' does not exist on type 'Event'
              style={{ color: `#${event.background_color}` }}
              className="flex flex-col text-sm font-normal text-brand-dark"
            >
              {ticket.event_start_date && (
                <span>
                  {formatDateRange(
                    ticket.event_start_date,
                    ticket.event_end_date
                  )}
                </span>
              )}
            </div>
          </EventDetail>

          {/* Timezone */}
          <EventDetail compact label="Timezone" icon={GlobeIcon}>
            <div
              // @ts-expect-error property 'background_color' does not exist on type 'Event'
              style={{ color: `#${event.background_color}` }}
              className="flex flex-col text-sm font-normal text-brand-dark"
            >
              {ticket.event_timezone && <span>{ticket.event_timezone}</span>}
            </div>
          </EventDetail>

          {ticket.event_location && <EventLocation event={event} />}

          {/* Registration Card */}
          {isPending ? (
            <Placeholder.Root>
              <Placeholder.Card />
            </Placeholder.Root>
          ) : (
            <RegistrationCard
              checkoutConfig={checkoutConfig!}
              requiresApproval={requiresApproval}
              hideRemaining={false}
            />
          )}

          {/* Event Details */}
          <div className="mt-10">
            <h3 className="text-base font-bold text-brand-ui-primary">
              About Event
            </h3>
            <hr className="my-2" />
            <p>{description}</p>
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default EventDetailDrawer
