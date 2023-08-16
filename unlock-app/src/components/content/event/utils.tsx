import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Metadata } from '~/components/interface/locks/metadata/utils'

dayjs.extend(utc)
dayjs.extend(timezone)

export const getEventDate = (ticket: any): Date | null => {
  if (ticket?.event_start_date) {
    const timestamp = [ticket.event_start_date, ticket.event_start_time].join(
      ' '
    )
    const dayjsLocal = dayjs.tz(timestamp, ticket.event_timezone)
    return dayjsLocal.toDate()
  }

  return null
}

export const getEventEndDate = (ticket: any): Date | null => {
  if (ticket?.event_end_date) {
    const timestamp = [ticket.event_end_date, ticket.event_end_time].join(' ')

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

export const getEventPath = ({
  metadata,
  lockAddress,
  network,
}: EventUrlProps): string => {
  const slug = metadata?.slug

  if (slug) {
    return `/event/${slug}`
  }
  return `/event?lockAddress=${lockAddress}&network=${network}`
}

export const getEventUrl = ({
  metadata,
  lockAddress,
  network,
}: EventUrlProps): string => {
  if (typeof window !== 'undefined' && window?.location?.origin) {
    return `${window.location.origin}${getEventPath({
      metadata,
      lockAddress,
      network,
    })}`
  }
  return getEventPath({
    metadata,
    lockAddress,
    network,
  })
}
