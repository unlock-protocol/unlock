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
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { AttendeeCues } from '../event/Registration/AttendeeCues'
import ReactMarkdown from 'react-markdown'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface EventOverviewCardProps {
  event: Event
  onClick: (event: Event) => void
}

export const EventOverviewCard: React.FC<EventOverviewCardProps> = ({
  event,
  onClick,
}) => {
  const { account } = useAuthenticate()
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
      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
        <img
          src={image}
          alt={name}
          className="w-full sm:w-40 h-40 rounded-md object-cover object-center"
          style={{ aspectRatio: '1 / 1' }}
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <h4 className="text-xl sm:text-2xl font-bold text-brand-ui-primary truncate">
              {name}
            </h4>
            {isUserEvent && (
              <Badge
                variant="green"
                className="mt-1 sm:mt-0 self-start sm:self-auto"
              >
                Organizer
              </Badge>
            )}
          </div>
          <ReactMarkdown
            children={data.description}
            className="mt-1 text-sm sm:text-base text-gray-500 line-clamp-2"
          />
        </div>

        {/* Attendee Cues */}
        {isCheckoutConfigPending ? (
          <Placeholder.Root>
            <Placeholder.Line />
          </Placeholder.Root>
        ) : (
          <div className="mt-3">
            <AttendeeCues checkoutConfig={checkoutConfig!} />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-3 text-sm sm:text-base">
          {eventStartDate && eventEndDate && (
            <p className="flex items-center font-medium text-gray-700">
              <DateIcon
                className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {dayjs(eventStartDate).format('D MMM YYYY')}
            </p>
          )}

          {eventStartTime && (
            <p className="flex items-center font-medium text-gray-700">
              <TimeIcon
                className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <span>{dayjs(eventStartTime, 'HH:mm').format('h:mm A')}</span>
            </p>
          )}
          {eventLocation && (
            <p className="flex items-center font-medium text-gray-700">
              <LocationIcon
                className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <span className="truncate max-w-[200px]">{eventLocation}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
