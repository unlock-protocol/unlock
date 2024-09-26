'use client'

import {
  FiCalendar as DateIcon,
  FiClock as TimeIcon,
  FiMapPin as LocationIcon,
} from 'react-icons/fi'
import React from 'react'
import { Event } from './EventsCollectionDetailContent'
import dayjs from 'dayjs'
import { Badge, Placeholder } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { AttendeeCues } from '../event/Registration/AttendeeCues'

interface EventOverviewCardProps {
  event: Event
  onClick: (event: Event) => void
}

export const EventOverviewCard: React.FC<EventOverviewCardProps> = ({
  event,
  onClick,
}) => {
  const { account } = useAuth()
  const { data: checkoutConfig, isPending: isCheckoutConfigPending } =
    useCheckoutConfig({
      id: event?.checkoutConfigId,
    })

  const { name, data, createdBy } = event

  if (!data) {
    return (
      <div className="flex bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-red-500">Event data is unavailable.</p>
      </div>
    )
  }

  const { image, attributes } = data

  const getEventAttribute = (type: string) => {
    const attr = attributes.find(
      (attribute: any) => attribute.trait_type === type
    )
    return attr ? attr.value : ''
  }

  const eventStartDate = getEventAttribute('event_start_date')
  const eventEndDate = getEventAttribute('event_end_date')
  const eventStartTime = getEventAttribute('event_start_time')
  const eventLocation = getEventAttribute('event_address')

  const isUserEvent = account && createdBy === account

  return (
    <div
      className="flex flex-col sm:flex-row bg-white border cursor-pointer border-gray-200 rounded-2xl p-4 hover:bg-gray-50"
      onClick={() => onClick(event)}
    >
      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:flex sm:items-center">
        <img
          src={image}
          alt={name}
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-md object-cover object-center"
          style={{ aspectRatio: '1 / 1' }}
        />
      </div>

      <div className="sm:ml-6 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <h4 className="text-2xl font-bold text-brand-ui-primary mb-2 sm:mb-0">
              {name}
            </h4>
            {isUserEvent && (
              <Badge variant="green" className="self-start sm:self-auto">
                Your Event
              </Badge>
            )}
          </div>
          <p className="mt-2 text-base text-gray-500 line-clamp-3">
            {data.description}
          </p>
        </div>

        {/* Attendee Cues */}
        {isCheckoutConfigPending ? (
          <Placeholder.Root>
            <Placeholder.Line />
          </Placeholder.Root>
        ) : (
          <div>
            <AttendeeCues checkoutConfig={checkoutConfig!} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap space-x-3 gap-4">
          {eventStartDate && eventEndDate && (
            <p className="flex items-center space-x-2 font-bold text-base text-gray-700">
              <DateIcon
                className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {dayjs(eventStartDate).format('D MMM YYYY')}
            </p>
          )}

          {eventStartTime && (
            <p className="flex items-center space-x-2 font-bold text-base text-gray-700">
              <TimeIcon
                className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <span>{dayjs(eventStartTime, 'HH:mm').format('h:mm A')}</span>
            </p>
          )}
          {eventLocation && (
            <p className="flex items-center space-x-2 font-bold text-base text-gray-700">
              <LocationIcon
                className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <span>{eventLocation}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
