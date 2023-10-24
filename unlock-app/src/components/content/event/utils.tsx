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
  lockAddress?: string // TODO: remove
  network?: string | number // TODO: remove
  event?: any // TODO: type this
}

export const getEventPath = ({
  metadata,
  lockAddress,
  network,
  event,
}: EventUrlProps): string => {
  const slug = event?.slug || metadata?.slug

  console.log(event)
  if (slug) {
    return `/event/${slug}`
  }
  return `/event?lockAddress=${lockAddress}&network=${network}`
}

export const getEventUrl = ({
  metadata,
  lockAddress,
  network,
  event,
}: EventUrlProps): string => {
  if (typeof window !== 'undefined' && window?.location?.origin) {
    return `${window.location.origin}${getEventPath({
      event,
      metadata,
      lockAddress,
      network,
    })}`
  }
  return getEventPath({
    event,
    metadata,
    lockAddress,
    network,
  })
}
