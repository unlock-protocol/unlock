import React from 'react'
import { Event } from './EventsCollectionDetailContent'
import { Drawer, Placeholder } from '@unlock-protocol/ui'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
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
  const { image, description, requiresApproval } = data

  const getEventAttribute = (type: string) => {
    const attr = data.attributes?.find(
      (attribute) => attribute.trait_type === type
    )
    return attr ? attr.value : ''
  }

  const eventStartDate = getEventAttribute('event_start_date')
  const eventEndDate = getEventAttribute('event_end_date')
  const eventStartTime = getEventAttribute('event_start_time')
  const eventEndTime = getEventAttribute('event_end_time')
  const eventLocation = getEventAttribute('event_address')
  const eventIsInPerson = getEventAttribute('event_is_in_person')

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
              {eventStartDate && eventEndDate && (
                <span>{dayjs(eventStartDate).format('dddd D MMM YYYY')}</span>
              )}
            </div>
          </EventDetail>

          {/* Time */}
          {eventStartTime && eventEndTime && (
            <EventDetail compact label="Time" icon={ClockIcon}>
              <div className="flex flex-col text-sm font-normal text-brand-dark">
                <span>{dayjs(eventStartTime, 'HH:mm').format('h:mm A')}</span>
              </div>
            </EventDetail>
          )}

          {/* Location */}
          {eventLocation && (
            <EventLocation
              inPerson={eventIsInPerson === 'true'}
              eventLocation={eventLocation}
              eventAddress={eventLocation}
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
