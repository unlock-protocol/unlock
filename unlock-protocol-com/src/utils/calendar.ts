import ical from 'cal-parser'
import { isFuture } from 'date-fns'
import makeUrls, { TCalendarEvent } from 'add-event-to-calendar'

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

const sortEvents = (events: CalendarEvent[]) => {
  return events?.sort((a, b) => {
    if (a.dtstart?.value && b.dtstart?.value) {
      return (
        new Date(a.dtstart?.value).getTime() -
        new Date(b.dtstart?.value).getTime()
      )
    }
  })
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
      return sortEvents(events ?? []) as CalendarEvent[]
    }

    return sortEvents(
      events?.filter((event) => {
        return event.dtstart?.value
          ? isFuture(new Date(event.dtstart.value))
          : false
      })
    )
  } catch (err) {
    console.error(err)
  }
}

export const getCalendarEventUrl = (
  event: CalendarEvent,
  type: 'google' | 'outlook' | 'ics' | 'yahoo' = 'google'
) => {
  const eventCalendar: TCalendarEvent = {
    name: event.summary?.value ?? '-',
    location: event?.location?.value ?? '-',
    details: event.description?.value ?? '',
    startsAt: event.dtstart.value,
    endsAt: event.dtend.value,
  }
  const urlObj = makeUrls(eventCalendar)
  return urlObj[type] ?? '#'
}
