import React from 'react'
import { Event } from './EventsCollectionDetailContent'
import { Drawer, Placeholder } from '@unlock-protocol/ui'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { AiOutlineGlobal as GlobeIcon } from 'react-icons/ai'
import { AiOutlineClockCircle as ClockIcon } from 'react-icons/ai'
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

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
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
  const { image, ticket, description, requiresApproval } = data

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="space-y-4">
        {/* Event Image */}
        <img
          src={image}
          alt={name}
          className="w-full h-[500px] object-cover rounded-2xl"
        />

        {/* Event Information */}
        <div className="space-y-4">
          <h3 className="text-xl text-brand-ui-primary font-semibold">
            {name}
          </h3>

          {organizers && organizers.length > 0 && (
            <Hosts organizers={organizers} />
          )}

          {/* Date */}
          <EventDetail compact label="Date" icon={CalendarIcon}>
            <div
              // @ts-expect-error property 'background_color' does not exist on type 'Event'
              style={{ color: `#${event.background_color}` }}
              className="flex flex-col text-sm font-normal text-brand-dark"
            >
              {ticket.event_start_date && (
                <span>
                  {dayjs(ticket.event_start_date).format('dddd D MMM YYYY')}
                  {ticket.event_end_date &&
                    ` to ${dayjs(ticket.event_end_date).format('dddd D MMM YYYY')}`}
                </span>
              )}
            </div>
          </EventDetail>

          {/* Time */}
          {ticket.event_start_time && ticket.event_end_time && (
            <EventDetail compact label="Time" icon={ClockIcon}>
              <div className="flex flex-col text-sm font-normal text-brand-dark">
                <span>
                  {ticket.event_start_time}
                  {ticket.event_end_time && ` to ${ticket.event_end_time}`}
                </span>
              </div>
            </EventDetail>
          )}

          {/* Timezone */}
          {ticket.event_timezone && (
            <EventDetail compact label="Timezone" icon={GlobeIcon}>
              <div
                // @ts-expect-error property 'background_color' does not exist on type 'Event'
                style={{ color: `#${event.background_color}` }}
                className="flex flex-col text-sm font-normal text-brand-dark"
              >
                <span>{ticket.event_timezone}</span>
              </div>
            </EventDetail>
          )}

          {ticket.event_location && (
            <EventLocation
              inPerson={ticket.event_is_in_person}
              eventLocation={ticket.event_location}
              eventAddress={ticket.event_address}
              compact={true}
            />
          )}

          {/* Registration Card */}
          {isCheckoutConfigPending ? (
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
