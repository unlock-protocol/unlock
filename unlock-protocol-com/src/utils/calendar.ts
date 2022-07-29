import ical from 'cal-parser'
import dayjs from 'dayjs'

export interface CalendarEvent {
  url: string
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
type Sort = 'asc' | 'desc'
const sortEvents = (events: CalendarEvent[], sort: Sort = 'asc') => {
  return events?.sort((a, b) => {
    if (sort === 'asc') {
      if (a.dtstart?.value && b.dtstart?.value) {
        return (
          new Date(a.dtstart?.value).getTime() -
          new Date(b.dtstart?.value).getTime()
        )
      }
    } else {
      if (a.dtstart?.value && b.dtstart?.value) {
        return (
          new Date(b.dtstart?.value).getTime() -
          new Date(a.dtstart?.value).getTime()
        )
      }
    }
  })
}
/**
 * Generate JSON array from ICS file
 * @param {fileUrl} string - file path
 * @return {events} array of events in JSON
 */
export const icalEventsToJson = async (
  fileUrl: string,
  type: 'future' | 'past' | 'all', // get future or past events or all,
  sort: Sort = 'asc'
): Promise<CalendarEvent[]> => {
  try {
    const calendarRaw = await fetch(fileUrl).then((res) => res.text())
    let { events } = ical.parseString(calendarRaw) as {
      events: CalendarEvent[]
    }

    events = sortEvents(events, sort)

    // add calendar url for every event
    events.forEach((event) => {
      event.url = getCalendarUrl(event)
    })

    if (type === 'all') {
      return events
    }

    return events?.filter((event) => {
      return event.dtstart?.value
        ? type === 'future'
          ? dayjs().isBefore(new Date(event.dtstart.value))
          : dayjs().isAfter(new Date(event.dtstart.value))
        : false
    })
  } catch (err) {
    console.error(err)
  }
}
/**
 * Generate calendar URL link, docs: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
 *
 * @param {event} CalendarEvent - event
 * @return {string} url to add in google calendar
 */
export const getCalendarUrl = (event: CalendarEvent): string => {
  const title = event.summary.value
  const description = event.description?.value ?? ''
  const location = event.location?.value ?? ''
  const startDate = dayjs(event.dtstart.value).format('YYYYMMDDTHHmmss')
  const endDate = dayjs(event.dtend.value).format('YYYYMMDDTHHmmss')
  const dates = `${startDate}/${endDate}`

  return `https://www.google.com/calendar/render?action=TEMPLATE&dates=${encodeURIComponent(
    dates
  )}&text=${encodeURIComponent(title)}&details=${encodeURIComponent(
    description
  )}&location=${encodeURIComponent(location)}&sf=true&output=xml`
}
