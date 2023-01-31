import { Modal, Tooltip } from '@unlock-protocol/ui'
import { google, outlook, office365, ics } from 'calendar-link'
import Link from 'next/link'
import { useState } from 'react'
import { BsCalendarDate } from 'react-icons/bs'
import { FaRegCalendarPlus } from 'react-icons/fa'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { getEventDate } from './utils'

import {
  SiGooglecalendar,
  SiMicrosoftoffice,
  SiMicrosoftoutlook,
} from 'react-icons/si'

interface AddToCalendarButtonProps {
  event: Partial<Metadata>
}

export const AddToCalendarButton = ({ event }: AddToCalendarButtonProps) => {
  const [isOpen, setOpen] = useState(false)
  const eventDate = getEventDate(event)

  // We can only add events with a date and name
  if (!eventDate || !event.name) {
    return null
  }

  const [hours, minutes] = event.time
    ? event.time.split(':').map((x: string) => parseInt(x, 10))
    : [0, 0]

  const calendarEvent = {
    title: event.name,
    start: eventDate.setHours(hours, minutes),
    description: event.description || '',
    allDay: true, // default for now... change once we have metadata for it (or for end)
    // https://github.com/AnandChowdhary/calendar-link#options
    url: event.url,
  }

  return (
    <>
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
                <SiGooglecalendar className="w-8 h-8 inline mr-3" />
                Google Calendar
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={outlook(calendarEvent)}
              >
                <SiMicrosoftoutlook className="w-8 h-8 inline mr-3" />
                Microsoft Outlook
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={office365(calendarEvent)}
              >
                <SiMicrosoftoffice className="w-8 h-8 inline mr-3" />
                Microsoft Office 365
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={ics(calendarEvent)}
              >
                <BsCalendarDate className="w-8 h-8 inline mr-3" />
                ICS file
              </Link>
            </li>
          </ul>
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
