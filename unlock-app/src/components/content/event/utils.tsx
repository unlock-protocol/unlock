import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { config } from '~/config/app'
import { CheckoutConfig } from '@unlock-protocol/core'
import { getCanonicalCheckoutPath } from '~/utils/checkoutUrl'

dayjs.extend(utc)
dayjs.extend(timezone)

interface EventDateFields {
  event_start_date?: string | null
  event_start_time?: string | null
  event_end_date?: string | null
  event_end_time?: string | null
  event_timezone?: string
}

interface EventPathProps {
  slug?: string | null
}

export const getEventDate = (ticket?: EventDateFields | null): Date | null => {
  if (ticket?.event_start_date) {
    const timestamp = [ticket.event_start_date, ticket.event_start_time].join(
      ' '
    )
    const dayjsLocal = dayjs.tz(timestamp, ticket.event_timezone)
    return dayjsLocal.toDate()
  }

  return null
}

export const getEventEndDate = (
  ticket?: EventDateFields | null
): Date | null => {
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
  event?: EventPathProps
}

export const getEventPath = ({
  metadata,
  lockAddress,
  network,
  event,
}: EventUrlProps): string => {
  const slug = event?.slug || metadata?.slug

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
  return `${config.unlockApp}${getEventPath({
    event,
    metadata,
    lockAddress,
    network,
  })}`
}

export const getCheckoutUrl = (checkoutConfig: CheckoutConfig) => {
  const url = new URL(`${window.location.origin}/checkout`)

  // remove redirectUri if not applicable
  if (checkoutConfig.config?.redirectUri?.length === 0) {
    delete checkoutConfig.config.redirectUri
  }

  if (checkoutConfig.id) {
    return new URL(
      getCanonicalCheckoutPath(checkoutConfig.id),
      window.location.origin
    ).toString()
  } else {
    url.searchParams.append(
      'checkoutConfig',
      JSON.stringify(checkoutConfig.config)
    )
  }
  return url.toString()
}
