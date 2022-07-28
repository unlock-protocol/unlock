import { Button } from '@unlock-protocol/ui'
import React from 'react'
import {
  FiCalendar as CalendarIcon,
  FiMapPin as MapPinIcon,
} from 'react-icons/fi'
import { Link } from '../../helpers/Link'
import { format } from 'date-fns'
import { CalendarEvent, getCalendarEventUrl } from '../../../utils/calendar'

interface UpcomingEventBoxProps {
  event: CalendarEvent
}

export const UpcomingEventBox: React.FC<UpcomingEventBoxProps> = ({
  event,
}) => {
  const title = event.summary.value
  const description = event.description?.value ?? ''
  const location = event.location?.value ?? ''
  const startDate = event?.dtstart.value
  const endDate = event?.dtend.value

  const locationIsUrl = location?.toLowerCase().startsWith('http') ?? false
  const formattedDate = format(new Date(startDate), 'eeee, MMMM d')
  const formattedHour = `${format(new Date(startDate), 'p')} - ${format(
    new Date(endDate),
    'p'
  )}`

  const calendarLink = getCalendarEventUrl(event)

  return (
    <div className="flex flex-col h-full gap-4 p-8 glass-pane rounded-xl">
      <div className="flex gap-2 items-center">
        <CalendarIcon className="stroke-brand-ui-primary" />
        <span className="text-brand-ui-primary text-sm font-semibold uppercase">
          <span>{formattedDate}</span>
          <span className="ml-3">{formattedHour}</span>
        </span>
      </div>
      <h3 className="block h-18 text-xl font-semibold sm:text-3xl line-clamp-2 overflow-hidden">
        {title}
      </h3>
      <p className="inline-block h-30 text-brand-gray line-clamp-5 md:line-clamp-10">
        {description}
      </p>

      <div className="flex flex-col mt-auto gap-4">
        {location && (
          <div className="flex gap-2 items-center mt-auto">
            <div className="w-4">
              <MapPinIcon />
            </div>
            <span className="text-brand-ui-primary text-lg font-bold break-all truncate overflow-hidden">
              {locationIsUrl ? (
                <Link href={location}>{location}</Link>
              ) : (
                location
              )}
            </span>
          </div>
        )}
        <Link href={calendarLink}>
          <Button className="w-full">Add to Calendar</Button>
        </Link>
      </div>
    </div>
  )
}
