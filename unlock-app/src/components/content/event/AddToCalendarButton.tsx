import { Modal, Tooltip } from '@unlock-protocol/ui'
import { google, outlook, office365, yahoo, ics } from 'calendar-link'
import Link from 'next/link'
import { useState } from 'react'
import { BsCalendarDate } from 'react-icons/bs'
import { FaRegCalendarPlus } from 'react-icons/fa'
import {
  SiGooglecalendar,
  SiMicrosoftoffice,
  SiMicrosoftoutlook,
  SiYahoo,
} from 'react-icons/si'
import { EventData } from './EventDetails'

interface AddToCalendarButtonProps {
  event: Partial<EventData>
}

export const AddToCalendarButton = ({ event }: AddToCalendarButtonProps) => {
  const [isOpen, setOpen] = useState(false)

  // We can only add events with a date and title
  if (!event.date || !event.title) {
    return null
  }

  const [hours, minutes] = event.time
    ? event.time.split(':').map((x) => parseInt(x, 10))
    : [0, 0]

  const calendarEvent = {
    title: event.title,
    start: event.date.setHours(hours, minutes),
    description: event.description || '',
    allDay: true, // default for now... change once we have metadata for it (or for end)
    // https://github.com/AnandChowdhary/calendar-link#options
    url: event.url,
  }

  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setOpen}>
        <div className="w-full mb-4">
          <p className="mb-4">Select your calendar application:</p>
          <div className="flex justify-between w-full">
            <Link
              target="_blank"
              className="p-4 hover:bg-blue-200 bg-blue-100 rounded border"
              href={google(calendarEvent)}
            >
              <SiGooglecalendar className="w-8 h-8" />
            </Link>
            <Link
              target="_blank"
              className="p-4 hover:bg-blue-200 bg-blue-100 rounded border"
              href={outlook(calendarEvent)}
            >
              <SiMicrosoftoutlook className="w-8 h-8" />
            </Link>
            <Link
              target="_blank"
              className="p-4 hover:bg-blue-200 bg-blue-100 rounded border"
              href={office365(calendarEvent)}
            >
              <SiMicrosoftoffice className="w-8 h-8" />
            </Link>
            <Link
              target="_blank"
              className="p-4 hover:bg-blue-200 bg-blue-100 rounded border"
              href={yahoo(calendarEvent)}
            >
              <SiYahoo className="w-8 h-8" />
            </Link>
            <Link
              target="_blank"
              className="p-4 hover:bg-blue-200 bg-blue-100 rounded border"
              href={ics(calendarEvent)}
            >
              <BsCalendarDate className="w-8 h-8" />
            </Link>
          </div>
        </div>
      </Modal>

      <Tooltip
        delay={0}
        label="Add to Calendar"
        tip="Add to Calendar"
        side="bottom"
      >
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 flex justify-center items-center"
        >
          <FaRegCalendarPlus className="w-6 h-6" />
        </button>
      </Tooltip>
    </>
  )
}

export default AddToCalendarButton
