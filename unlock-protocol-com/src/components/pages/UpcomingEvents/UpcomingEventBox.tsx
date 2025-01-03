import { Button, Modal } from '@unlock-protocol/ui'
import { FaRegCalendarPlus } from 'react-icons/fa'

import { SiGooglecalendar } from 'react-icons/si'
import { PiMicrosoftOutlookLogoFill } from 'react-icons/pi'
import { BsCalendarDate, BsMicrosoft } from 'react-icons/bs'

import { google, outlook, office365, ics } from 'calendar-link'
import React, { useState } from 'react'
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
  const [isOpen, setOpen] = useState(false)
  const location = event?.location ?? ''
  const startDate = dayjs(event?.start?.date || event?.start?.dateTime)
  const endDate = dayjs(event?.end?.date || event?.end?.dateTime)

  const locationIsUrl = location?.toLowerCase().startsWith('http') ?? false

  const startDateWeekday = weekday[startDate.day()]
  const endDateWeekday = weekday[startDate.day()]
  const startDateYear = startDate.year()

  const isSameDay = startDate.diff(endDate, 'day') === 0

  const formattedDate = `${startDateWeekday}, ${startDate.format(
    `MMMM D`
  )}, ${startDateYear}`
  const formattedHour = isSameDay
    ? `${startDate.format('HH:mm A')} - ${endDate.format('HH:mm A')}`
    : `${startDate.format('HH:mm')}`

  const formattedEndDate = `${endDateWeekday}, ${endDate.format(
    'MMMM D'
  )}, ${startDateYear}`

  const extraClassDisabled = disabled ? 'opacity-60 pointer-events-none' : ''

  const calendarEvent = {
    title: event.summary,
    start: event.start.dateTime || event.start.date,
    location,
    description: event.description,
    end: event.end.dateTime || event.end.date,
    url: event.url,
    allDay: !event.start.dateTime,
  }

  return (
    <div className="flex flex-col h-full gap-4 p-7 glass-pane rounded-xl">
      <Modal isOpen={isOpen} setIsOpen={setOpen}>
        <div className="w-full">
          <p className="mb-2">Select your calendar application:</p>
          <ul className="flex flex-col justify-between w-full">
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={google(calendarEvent)}
              >
                <SiGooglecalendar className="inline w-8 h-8 mr-3" />
                Google Calendar
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={outlook(calendarEvent)}
              >
                <PiMicrosoftOutlookLogoFill className="inline w-8 h-8 mr-3" />
                Microsoft Outlook
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={office365(calendarEvent)}
              >
                <BsMicrosoft className="inline w-8 h-8 mr-3" />
                Microsoft Office 365
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={ics(calendarEvent)}
              >
                <BsCalendarDate className="inline w-8 h-8 mr-3" />
                ICS file
              </Link>
            </li>
          </ul>
        </div>
      </Modal>
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
          <Button
            onClick={() => setOpen(true)}
            className="w-full"
            iconLeft={<FaRegCalendarPlus />}
          >
            Add to Calendar
          </Button>
        )}
      </div>
    </div>
  )
}
