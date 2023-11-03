import dayjs from 'dayjs'
import { kebabCase } from 'lodash'
import * as metadataOperations from './metadataOperations'
import { getLockTypeByMetadata } from '@unlock-protocol/core'
import { EventData } from '../models'

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
  startDate: Date | null
  endDate: Date | null
  eventUrl: string | null
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

export const getEventDataForLock = async (
  lockAddress: string,
  network?: number
): Promise<EventProps | undefined> => {
  if (!network) return

  let eventDetail = undefined

  const lockMetadata = await metadataOperations.getLockMetadata({
    lockAddress,
    network: network!,
  })

  const types = getLockTypeByMetadata(lockMetadata)

  const attributes: AttributeProps[] = lockMetadata?.attributes || []

  // Util function!
  const getAttribute = (name: string): string | undefined => {
    return (
      attributes?.find(({ trait_type }: AttributeProps) => trait_type === name)
        ?.value || undefined
    )
  }

  if (types.isEvent) {
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

    const eventEndDate = endDate?.toLocaleDateString(undefined, {
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

    const eventDate =
      isSameDay || !endDate
        ? `${eventStartDate}`
        : `${eventStartDate} to ${eventEndDate}`

    const eventTime = isSameDay
      ? `${eventStartTime} to ${eventEndTime}`
      : `${eventStartTime}`

    eventDetail = {
      eventName: lockMetadata?.name || '',
      eventDescription: lockMetadata?.description,
      eventDate,
      eventTime,
      eventAddress,
      startDate,
      eventUrl: lockMetadata?.external_url,
      endDate,
    }
  }

  return eventDetail
}

export const getEventBySlug = async (slug: string) => {
  return await EventData.findOne({
    where: {
      slug,
    },
  })
}

export const createEventSlug = async (
  name: string,
  eventId?: number,
  index: number | undefined = undefined
): Promise<string> => {
  const slug = index ? kebabCase([name, index].join('-')) : kebabCase(name)
  const event = await getEventBySlug(slug)
  if (!!event && event.id !== eventId) {
    return createEventSlug(name, eventId, index ? index + 1 : 1)
  }
  return slug
}
