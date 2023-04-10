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

export interface LockTypes {
  isEvent: boolean
  isCertification: boolean
  isStamp: boolean
}

export const getLockTypeByMetadata = (
  metadata?: Partial<Metadata>
): LockTypes => {
  const attributes: Metadata['attributes'] = metadata?.attributes ?? []
  const hasAttribute = (name: 'event' | 'certification' | 'stamp') => {
    return attributes.some((attribute) =>
      attribute?.trait_type?.startsWith(name)
    )
  }

  return {
    isEvent: hasAttribute('event'),
    isCertification: hasAttribute('certification'),
    isStamp: hasAttribute('stamp'),
  }
}
