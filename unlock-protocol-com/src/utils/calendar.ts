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
  type: 'future' | 'past' | 'all' // get future or past events or all
): Promise<CalendarEvent[]> => {
  try {
    const calendarRaw = await fetch(fileUrl).then((res) => res.text())
    let { events } = ical.parseString(calendarRaw) as {
      events: CalendarEvent[]
    }

    events = sortEvents(events)

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

export const getCalendarUrl = (event: CalendarEvent): string => {
  const title = event.summary.value
  const description = event.description?.value ?? ''
  const location = event.location?.value ?? ''

  const startDate = `${dayjs(event.dtstart.value).format('YYYYMMDDTHHmm00')}Z`
  const endDate = `${dayjs(event.dtend.value).format('YYYYMMDDTHHmm00')}Z`

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${startDate}/${endDate}&location=${location}&sf=true&output=xml`
}
