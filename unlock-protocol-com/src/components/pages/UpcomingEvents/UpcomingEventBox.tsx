import { Button } from '@unlock-protocol/ui'
import React from 'react'
import {
  FiCalendar as CalendarIcon,
  FiMapPin as MapPinIcon,
} from 'react-icons/fi'
import { Link } from '../../helpers/Link'
import dayjs from 'dayjs'
import { CalendarItem } from '../../../utils/calendar'

const weekday = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

interface UpcomingEventBoxProps {
  event: CalendarItem
  disabled?: boolean
}

export const UpcomingEventBox: React.FC<UpcomingEventBoxProps> = ({
  event,
  disabled,
}) => {
  const location = event?.location ?? ''
  const startDate = dayjs(event?.start?.date || event?.start?.dateTime)
  const endDate = dayjs(event?.end?.date || event?.end?.dateTime)

  const locationIsUrl = location?.toLowerCase().startsWith('http') ?? false

  const startDateWeekday = weekday[startDate.day()]
  const endDateWeekday = weekday[startDate.day()]

  const isSameDay = startDate.diff(endDate, 'day') === 0

  const formattedDate = `${startDateWeekday}, ${startDate.format(`MMMM D`)}`
  const formattedHour = isSameDay
    ? `${startDate.format('HH:mm A')} - ${endDate.format('HH:mm A')}`
    : `${startDate.format('HH:mm')}`

  const formattedEndDate = `${endDateWeekday}, ${endDate.format('MMMM D')}`

  const extraClassDisabled = disabled ? 'opacity-60 pointer-events-none' : ''

  return (
    <div className="flex flex-col h-full gap-4 p-7 glass-pane rounded-xl">
      <div className="flex items-center gap-2">
        <CalendarIcon className="stroke-brand-ui-primary" />
        <span
          className={[
            'flex flex-col gap-1 w-full ml-2 text-brand-ui-primary text-sm font-semibold uppercase',
            extraClassDisabled,
          ].join(' ')}
        >
          {isSameDay ? (
            <>
              <span className="inline-block">{formattedDate}</span>
              <span className="inline-block">{formattedHour}</span>
            </>
          ) : (
            <>
              <span className="inline-block">{formattedDate}</span>
              <span className="inline-block">{formattedEndDate}</span>
            </>
          )}
        </span>
      </div>
      <h3
        className={[
          'block h-18 text-xl font-semibold sm:text-3xl line-clamp-2 overflow-hidden',
          extraClassDisabled,
        ].join(' ')}
      >
        {event.summary}
      </h3>
      <p
        className={[
          ' inline-block h-30 text-brand-gray line-clamp-5 md:line-clamp-10',
          extraClassDisabled,
        ].join(' ')}
        dangerouslySetInnerHTML={{
          __html: event.description,
        }}
      ></p>
      <div className="flex flex-col gap-4 mt-auto">
        {location && (
          <div className="flex items-center gap-2 mt-auto">
            <div className="w-4">
              <MapPinIcon />
            </div>
            <span
              className={[
                'text-brand-ui-primary text-lg font-bold break-all truncate overflow-hidden',
                extraClassDisabled,
              ].join(' ')}
            >
              {locationIsUrl && !disabled ? (
                <Link href={location}>{location}</Link>
              ) : (
                location
              )}
            </span>
          </div>
        )}
        {!disabled && (
          <Link href={event.url ?? '#'}>
            <Button className="w-full">Add to Calendar</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
