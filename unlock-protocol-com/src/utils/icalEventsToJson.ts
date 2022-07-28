import ical from 'cal-parser'
import { isFuture } from 'date-fns'

export interface CalendarEvent {
  dtstart: {
    value: string
  }
  dtend: {
    value?: string
  }
  dtstamp: string
  organizer: {
    value?: string
    params?: {
      cn?: string
    }
  }
  uid: {
    value: string
  }
  attendee: {
    value: string
    params: {
      cutype: string
      role: string
      partstat: string
      cn: string
    }
  }
  created: string
  description: {
    value?: string
  }
  'last-modified': string
  location: {
    value?: string
  }
  sequence: {
    value?: string
    params?: {
      testparam?: string
    }
  }
  status: {
    value?: string
  }
  summary: {
    value?: string
  }
  transp: {
    value?: string
  }
}

export const icalEventsToJson = async (
  fileUrl: string,
  futureEventsOnly = true
): Promise<CalendarEvent[]> => {
  try {
    const calendarRaw = await fetch(fileUrl).then((res) => res.text())
    const { events } = ical.parseString(calendarRaw) as {
      events: CalendarEvent[]
    }

    if (!futureEventsOnly) {
      return (events ?? []) as CalendarEvent[]
    }

    return events?.filter((event) => {
      return event.dtstart?.value
        ? isFuture(new Date(event.dtstart.value))
        : false
    })
  } catch (err) {
    console.error(err)
  }
}
