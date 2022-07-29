import { Button } from '@unlock-protocol/ui'
import React from 'react'
import {
  FiCalendar as CalendarIcon,
  FiMapPin as MapPinIcon,
} from 'react-icons/fi'
import { Link } from '../../helpers/Link'
import dayjs from 'dayjs'
import { CalendarEvent } from '../../../utils/calendar'

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
  event: CalendarEvent
  disabled?: boolean
}

export const UpcomingEventBox: React.FC<UpcomingEventBoxProps> = ({
  event,
  disabled,
}) => {
  const location = event.location?.value ?? ''
  const startDate = dayjs(event?.dtstart.value)
  const endDate = dayjs(event?.dtend.value)

  const locationIsUrl = location?.toLowerCase().startsWith('http') ?? false

  const weekDay = weekday[startDate.day()]
  const formattedDate = `${weekDay}, ${startDate.format(`MMMM D`)}`
  const formattedHour = `${startDate.format('HH:mm A')} -${endDate.format(
    'HH:mm A'
  )}`

  const extraClassDisabled = disabled ? 'opacity-60' : ''

  return (
    <div className="flex flex-col h-full gap-4 p-7 glass-pane rounded-xl">
      <div className="flex gap-2 items-center">
        <CalendarIcon className="stroke-brand-ui-primary" />
        <span
          className={[
            'flex flex-col gap-1 w-full ml-2 text-brand-ui-primary text-sm font-semibold uppercase',
            extraClassDisabled,
          ].join(' ')}
        >
          <span className="inline-block">{formattedDate}</span>
          <span className="inline-block">{formattedHour}</span>
        </span>
      </div>
      <h3
        className={[
          'block h-18 text-xl font-semibold sm:text-3xl line-clamp-2 overflow-hidden',
          extraClassDisabled,
        ].join(' ')}
      >
        {event.summary.value}
      </h3>
      <p
        className={[
          ' inline-block h-30 text-brand-gray line-clamp-5 md:line-clamp-10',
          extraClassDisabled,
        ].join(' ')}
      >
        {event.description?.value ?? ''}
      </p>

      <div className="flex flex-col mt-auto gap-4">
        {location && (
          <div className="flex gap-2 items-center mt-auto">
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
