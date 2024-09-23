'use client'

import {
  FiCalendar as DateIcon,
  FiClock as TimeIcon,
  FiMapPin as LocationIcon,
} from 'react-icons/fi'
import React from 'react'
import { Event } from './EventsCollectionDetailContent'
import dayjs from 'dayjs'
import { Badge } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'

interface EventOverviewCardProps {
  event: Event
  onClick: (event: Event) => void
}

export const EventOverviewCard: React.FC<EventOverviewCardProps> = ({
  event,
  onClick,
}) => {
  const { account } = useAuth()
  const { name, data, createdBy } = event

  if (!data) {
    return (
      <div className="flex bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-red-500">Event data is unavailable.</p>
      </div>
    )
  }

  const { image, ticket, attributes } = data

  const getEventAttribute = (type: string) => {
    const attr = attributes.find((attribute) => attribute.trait_type === type)
    return attr ? attr.value : ''
  }

  const eventStartDate = getEventAttribute('event_start_date')
  const eventEndDate = getEventAttribute('event_end_date')
  const eventStartTime = getEventAttribute('event_start_time')
  const eventEndTime = getEventAttribute('event_end_time')
  const eventLocation = ticket.event_location

  const isUserEvent = account && createdBy === account

  return (
    <div
      className="flex flex-col sm:flex-row bg-white border cursor-pointer border-gray-200 rounded-2xl p-4 hover:bg-gray-50"
      onClick={() => onClick(event)}
    >
      <div className="flex-shrink-0 mb-4 sm:mb-0">
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
            <h4 className="text-xl font-bold text-brand-ui-primary mb-2 sm:mb-0">
              {name}
            </h4>
            {isUserEvent && (
              <Badge variant="green" className="self-start sm:self-auto">
                Your Event
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">{data.description}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          {eventStartDate && (
            <p className="flex items-center space-x-2 text-sm text-gray-700">
              <DateIcon
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                aria-hidden="true"
              />
              <span>{dayjs(eventStartDate).format('D MMM YYYY')}</span>
            </p>
          )}
          {eventEndDate && (
            <p className="flex items-center space-x-2 text-sm text-gray-700">
              <DateIcon
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                aria-hidden="true"
              />
              <span>{dayjs(eventEndDate).format('D MMM YYYY')}</span>
            </p>
          )}
          {eventStartTime && (
            <p className="flex items-center space-x-2 text-sm text-gray-700">
              <TimeIcon
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                aria-hidden="true"
              />
              <span>{dayjs(eventStartTime, 'HH:mm').format('h:mm A')}</span>
            </p>
          )}
          {eventEndTime && (
            <p className="flex items-center space-x-2 text-sm text-gray-700">
              <TimeIcon
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                aria-hidden="true"
              />
              <span>{dayjs(eventEndTime, 'HH:mm').format('h:mm A')}</span>
            </p>
          )}
          {eventLocation && (
            <p className="flex items-center space-x-2 text-sm text-gray-700">
              <LocationIcon
                className="h-5 w-5 flex-shrink-0 text-gray-300"
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
