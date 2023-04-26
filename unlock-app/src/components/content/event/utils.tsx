import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Metadata } from '~/components/interface/locks/metadata/utils'

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

export const getEventEndDate = (ticket: any): Date | null => {
  if (ticket?.event_end_date && ticket?.event_end_time) {
    const timestamp = `${ticket.event_end_date} ${ticket.event_end_time}`
    const dayjsLocal = dayjs.tz(timestamp, ticket.event_timezone)
    return dayjsLocal.toDate()
  }

  return null
}

interface EventUrlProps {
  metadata?: Partial<Metadata>
  lockAddress: string
  network: string | number
}

export const getEventUrl = ({
  metadata,
  lockAddress,
  network,
}: EventUrlProps): string => {
  const slug = metadata?.slug

  if (slug) {
    return `/event?s=${slug}`
  }
  return `/event?lockAddress=${lockAddress}&network=${network}`
}
