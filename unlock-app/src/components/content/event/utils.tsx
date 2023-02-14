import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const getEventDate = (ticket: any): Date | null => {
  if (ticket?.event_start_date && ticket?.event_start_time) {
    const timestamp = `${ticket.event_start_date} ${ticket.event_start_time}`
    const dayjsLocal = dayjs.tz(timestamp, ticket.event_timezone)
    return dayjsLocal.toDate()
  }

  return null
}
