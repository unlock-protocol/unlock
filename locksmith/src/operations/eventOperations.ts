import dayjs from '../config/dayjs'
import { kebabCase } from 'lodash'
import * as metadataOperations from './metadataOperations'
import { PaywallConfig, getLockTypeByMetadata } from '@unlock-protocol/core'
import { CheckoutConfig, EventData } from '../models'
import { saveCheckoutConfig } from './checkoutConfigOperations'
import { EventBodyType } from '../controllers/v2/eventsController'
import { Op } from 'sequelize'
import { removeProtectedAttributesFromObject } from '../utils/protectedAttributes'
// Configuration module for accessing project settings
import config from '../config/config'
import logger from '../logger'

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

export const getEventForLock = async (
  lockAddress: string,
  network: number,
  includeProtected: boolean
) => {
  const checkoutConfigs = await CheckoutConfig.findAll({
    where: {
      [Op.or]: [
        { [`config.locks.${lockAddress}.network`]: network },
        { [`config.locks.${lockAddress.toLowerCase()}.network`]: network },
      ],
    },
    order: [['updatedAt', 'DESC']],
  })

  // If there are checkout configs, let's see if an even exists with them!
  // Let's now find any event that uses this checkout config!
  const event = await EventData.findOne({
    where: {
      checkoutConfigId: checkoutConfigs.map((record) => record.id),
    },
  })
  if (event && !includeProtected) {
    event.data = removeProtectedAttributesFromObject(event.data)
  }
  return event
}

export const getEventMetadataForLock = async (
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
      timeZone,
    })

    const eventEndDate = endDate?.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone,
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

export const getEventBySlug = async (
  slug: string,
  includeProtected: boolean
) => {
  const event = await EventData.findOne({
    where: {
      slug,
    },
  })
  if (event && !includeProtected) {
    event.data = removeProtectedAttributesFromObject(event.data)
  }
  return event
}

export const createEventSlug = async (
  name: string,
  index: number | undefined = undefined
): Promise<string> => {
  const cleanName = name.replace(/[^\x20-\x7E]/g, '')
  const slug = index
    ? kebabCase([cleanName, index].join('-'))
    : kebabCase(cleanName)
  const event = await getEventBySlug(slug, false /** includeProtected */)
  if (event) {
    return createEventSlug(name, index ? index + 1 : 1)
  }
  return slug
}

export const saveEvent = async (
  parsed: EventBodyType,
  walletAddress: string
): Promise<[EventData, boolean]> => {
  const slug = parsed.data.slug || (await createEventSlug(parsed.data.name))
  const [savedEvent, created] = await EventData.upsert(
    {
      name: parsed.data.name,
      slug,
      data: {
        ...parsed.data,
        slug, // Making sure we add the slug to the data as well.
      },
      createdBy: walletAddress,
    },
    {
      conflictFields: ['slug'],
    }
  )
  if (!savedEvent.checkoutConfigId) {
    const checkoutConfig = await PaywallConfig.strip().parseAsync(
      parsed.checkoutConfig.config
    )
    const createdConfig = await saveCheckoutConfig({
      name: `Checkout config for ${savedEvent.name} (${savedEvent.slug})`,
      config: checkoutConfig,
      createdBy: walletAddress,
    })
    // And now attach the id to the savedEvent
    savedEvent.checkoutConfigId = createdConfig.id
    await savedEvent.save()
  }
  return [savedEvent, !!created]
}

// Retrieve Huddle API key from project's configuration
const huddleApiKey = config.huddleApiKey

interface TokenGatedResponseSuccess {
  message: string
  data: {
    roomId: string
  }
}

/**
 * Creates a token-gated room for an event on the Huddle01 platform.
 * This function constructs a POST request to create a room that's accessible to only event attendees.
 *
 * @param {string} title - The title of the room.
 * @param {string} chain - The blockchain chain on which the token exists (must be in uppercase).
 * @param {string} contractAddress - The lock address.
 * @throws {Error} Throws an error if the operation fails, either from network issues or API constraints.
 * @returns {Promise<any>} A promise that resolves to the data of the newly created room if successful.
 */
export async function createTokenGatedRoom(
  title: string,
  chain: string,
  contractAddress: string
): Promise<any> {
  // Ensure the API key is present before attempting the request
  if (!huddleApiKey) {
    throw new Error('Huddle API key is not defined.')
  }

  // Prepare headers for the HTTP request including the API key for authentication
  const headers = {
    'Content-type': 'application/json',
    'x-api-key': huddleApiKey,
  }

  // Format the request body with necessary details for creating a token-gated room
  const body = JSON.stringify({
    title,
    // Hardcoded to ERC721 – Unlock's lock token standard
    tokenType: 'ERC721',
    chain,
    // Ensure the lock address is sent as an array
    contractAddress: [contractAddress],
  })

  try {
    const response = await fetch(
      'https://api.huddle01.com/api/v1/create-room',
      {
        method: 'POST',
        body,
        headers,
      }
    )

    const responseData = await response.json()

    // Check if the API response was successful, throw an error if not
    if (!response.ok) {
      logger.error('API Error Response:', responseData)
      const errorDetails = responseData.message || 'Unknown error occurred'
      throw new Error(`Failed to create token gated room: ${errorDetails}`)
    }

    // Return the response data if the request was successful
    return responseData
  } catch (error) {
    // Handle any errors that occur during fetch or JSON parsing
    logger.error('Fetch or JSON parsing error:', error.message)
    throw new Error(`Network or parsing error: ${error.message}`)
  }
}
