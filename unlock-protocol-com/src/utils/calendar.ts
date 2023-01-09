import dayjs from 'dayjs'
import { unlockConfig } from '../config/unlock'

type EventDate = {
  date?: string
  dateTime?: string
}

// https://developers.google.com/calendar/api/v3/reference/events#resource
export interface CalendarItem {
  king: string
  id: string
  summary: string
  description: string
  location: string
  start: EventDate
  end: EventDate
  iCalUID: string
  url?: string
  recurringEventId?: string
}
export interface Calendar {
  kind: string
  items: CalendarItem[]
}

const getUnlockEvents = async (): Promise<CalendarItem[]> => {
  const CALENDAR_ID = 'c_dm3gud9ph6jqk7epq6jtij8u00@group.calendar.google.com'
  const CALENDAR_URL =
    `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?` +
    new URLSearchParams({
      key: unlockConfig.gApiKey,
      orderBy: 'startTime',
      singleEvents: 'true',
    })

  const calendar: Calendar = await fetch(CALENDAR_URL).then((res) => res.json())

  const recurringEvents = {}

  return calendar?.items
    ?.filter((event: CalendarItem) => {
      const startDate = event?.start?.date || event?.start?.dateTime
      // For future recurriung events, only show a single instance
      if (event.recurringEventId && dayjs().isBefore(startDate)) {
        if (recurringEvents[event.recurringEventId]) {
          return false
        }
        recurringEvents[event.recurringEventId] = true
      }
      return true
    })
    .reverse()
}
/**
 * Get list of events
 * @param {type} string - file path
 * @return {events} array of events in JSON
 */
export const getEvents = async (
  type: 'future' | 'past' | 'all' // get future or past events or all,
): Promise<CalendarItem[]> => {
  try {
    const events = await getUnlockEvents()

    // add calendar url for every event
    events.forEach((event) => {
      event.url = getCalendarUrl(event)
    })

    if (type === 'all') {
      return events
    }

    return events?.filter((event: CalendarItem) => {
      const endDate = dayjs(event?.end?.date || event?.end?.dateTime)

      return endDate
        ? type === 'future'
          ? dayjs().isBefore(endDate)
          : dayjs().isAfter(endDate)
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
export const getCalendarUrl = (event: CalendarItem): string => {
  const eventStartDate = event?.start?.date || event?.start?.dateTime
  const eventEndDate = event?.end?.date || event?.end?.dateTime
  const title = event.summary
  const description = event.description ?? ''
  const location = event.location ?? ''
  const startDate = dayjs(eventStartDate).format('YYYYMMDDTHHmmss')
  const endDate = dayjs(eventEndDate).format('YYYYMMDDTHHmmss')
  const dates = `${startDate}/${endDate}`

  const url = new URL(
    'https://www.google.com/calendar/render?action=TEMPLATE&sf=true&output=xml'
  )

  url.searchParams.append('text', title)
  url.searchParams.append('details', description)
  url.searchParams.append('location', location)
  url.searchParams.append('dates', dates)

  return url.toString()
}
