import { Modal, Tooltip } from '@unlock-protocol/ui'
import { google, outlook, office365, ics } from 'calendar-link'
import Link from 'next/link'
import { useState } from 'react'
import { BsCalendarDate } from 'react-icons/bs'
import { FaRegCalendarPlus } from 'react-icons/fa'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { getEventDate, getEventEndDate } from './utils'

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
  const eventDate = getEventDate(event.ticket)

  const endDate = getEventEndDate(event.ticket)

  // We can only add events with a date and name
  if (!eventDate || !event.name) {
    return null
  }

  const calendarEvent = {
    title: event.name,
    start: eventDate,
    location: event.ticket.event_address,
    description: event.description || '',
    allDay: !event.ticket.event_start_date,
    end: endDate,
    url: window.location.toString(),
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
                <SiMicrosoftoutlook className="inline w-8 h-8 mr-3" />
                Microsoft Outlook
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={office365(calendarEvent)}
              >
                <SiMicrosoftoffice className="inline w-8 h-8 mr-3" />
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

      <Tooltip
        delay={0}
        label="Add to Calendar"
        tip="Add to Calendar"
        side="bottom"
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-12 h-12"
        >
          <FaRegCalendarPlus className="w-6 h-6" />
        </button>
      </Tooltip>
    </>
  )
}

export default AddToCalendarButton
