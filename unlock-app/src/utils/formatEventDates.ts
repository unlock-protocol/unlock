import dayjs from 'dayjs'
import {
  getEventDate,
  getEventEndDate,
} from '../components/content/event/utils'

export interface FormattedEventDates {
  eventDate: Date | null
  eventEndDate: Date | null
  isSameDay: boolean
  startDate: string | null
  startTime?: string
  endDate: string | null
  endTime: string | null
  hasDate: boolean
  hasLocation: boolean
  hasPassed: boolean
}

/**
 * Formats event date and time details based on the provided event ticket.
 * Also returns boolean flags for date, location, and whether the event has passed.
 * @param ticket - The event ticket object containing date/time information.
 * @param locale - Optional locale; defaults to navigator.language or 'en-US' if not available.
 * @returns An object with formatted date/time strings and boolean flags.
 */
export const formatEventDates = (
  ticket: any,
  locale?: string
): FormattedEventDates => {
  const eventDate = getEventDate(ticket)
  const eventEndDate = getEventEndDate(ticket)
  const isSameDay =
    eventDate && eventEndDate
      ? dayjs(eventDate).isSame(eventEndDate, 'day')
      : false

  let startDate: string | null = null
  let startTime: string | undefined = undefined
  let endDate: string | null = null
  let endTime: string | null = null

  const userLocale =
    locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US')

  if (eventDate) {
    startDate = eventDate.toLocaleDateString(undefined, {
      timeZone: ticket.event_timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    if (ticket.event_start_time) {
      startTime = eventDate.toLocaleTimeString(userLocale, {
        timeZone: ticket.event_timezone,
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    }
  }

  if (eventEndDate) {
    if (!isSameDay) {
      endDate = eventEndDate.toLocaleDateString(undefined, {
        timeZone: ticket.event_timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } else if (ticket.event_end_time) {
      endTime = eventEndDate.toLocaleTimeString(userLocale, {
        timeZone: ticket.event_timezone,
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    }
  }

  const hasDate = Boolean(startDate || startTime || endDate || endTime)
  const hasLocation = Boolean(
    ticket.event_address && ticket.event_address.length > 0
  )

  const hasPassed = eventEndDate
    ? dayjs().isAfter(eventEndDate)
    : eventDate
      ? dayjs().isAfter(eventDate)
      : false

  return {
    eventDate,
    eventEndDate,
    isSameDay,
    startDate,
    startTime,
    endDate,
    endTime,
    hasDate,
    hasLocation,
    hasPassed,
  }
}
