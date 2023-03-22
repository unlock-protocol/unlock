import dayjs from 'dayjs'
import * as metadataOperations from './metadataOperations'

interface AttributeProps {
  value: string
  trait_type: string
}

export interface EventProps {
  eventDescription: string
  eventTime: string
  eventDate: string
  eventAddress: string
  eventName: string
}

const getEventDate = (
  startDate?: string,
  startTime?: string,
  timezone?: string
): Date | null => {
  if (startDate && startTime) {
    const timestamp = `${startDate} ${startTime}`
    const dayjsLocal = dayjs.tz(timestamp, timezone)
    return dayjsLocal.toDate()
  }

  return null
}

export const getEventDetail = async (
  lockAddress: string,
  network?: number
): Promise<EventProps | undefined> => {
  if (!network) return

  let eventDetail = undefined

  const lockMetadata = await metadataOperations.getLockMetadata({
    lockAddress,
    network: network!,
  })

  const attributes: AttributeProps[] = lockMetadata?.attributes

  const getAttribute = (name: string): string | undefined => {
    return (
      attributes?.find(({ trait_type }: AttributeProps) => trait_type === name)
        ?.value || undefined
    )
  }

  // This is an event, collect event information
  if (attributes) {
    const timeZone = getAttribute('event_timezone')

    const startDate =
      getEventDate(
        getAttribute('event_start_date'),
        getAttribute('event_start_time'),
        timeZone
      ) ?? null

    // get end date or fallback to 1 hour when not available
    const endDate =
      getEventDate(
        getAttribute('event_end_date'),
        getAttribute('event_end_time'),
        timeZone
      ) ?? (startDate ? dayjs(startDate).add(1, 'hour').toDate() : null)

    const eventAddress = getAttribute('event_address') ?? ''

    const isSameDay = dayjs(startDate).isSame(endDate, 'day')

    const eventStartDate = startDate?.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const eventEndDate = startDate?.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const eventStartTime = startDate?.toLocaleTimeString('en-US', {
      timeZone,
    })

    const eventEndTime = endDate?.toLocaleTimeString('en-US', {
      timeZone,
    })

    const eventDate = isSameDay
      ? `${eventStartDate}`
      : `${eventStartDate} to ${eventEndDate}`

    const eventTime = isSameDay
      ? `${eventStartTime} to ${eventEndTime}`
      : `${eventStartTime}`

    eventDetail = {
      eventName: lockMetadata?.name,
      eventDescription: lockMetadata?.description,
      eventDate,
      eventTime,
      eventAddress,
    }
  }

  return eventDetail
}
