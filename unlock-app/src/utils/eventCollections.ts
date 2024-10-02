import { locksmith } from '~/config/locksmith'

/**
 * Represents the attributes of an event.
 */
export interface EventAttributes {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  timezone: string
  address: string
  location: string
  isInPerson: boolean
}

/**
 * Fetches the details of an event collection based on the provided slug.
 * This utility function is intended for use in page server components,
 * allowing them to retrieve event collection data efficiently.
 *
 * @param {string} slug - The unique identifier for the event collection.
 * @returns {Promise<Object>} - A promise that resolves to the event collection data.
 * @throws {Error} - Throws an error if the event collection is not found (404)
 *                   or if the fetch operation fails for any other reason.
 */
export async function getEventCollection(slug: string) {
  const response = await locksmith.getEventCollection(slug)

  if (response.status !== 200) {
    if (response.status === 404) {
      throw new Error('Event collection not found')
    }
    throw new Error('Failed to fetch event collection')
  }

  return response.data
}

/**
 * Checks if the user is a collection manager.
 *
 * @param {string[] | undefined} managerAddresses - Array of manager addresses.
 * @param {string | null} account - The user's account address.
 * @returns {boolean} - True if the user is a manager, false otherwise.
 */
export const isCollectionManager = (
  managerAddresses: string[] | undefined,
  account: string | null
) => {
  return managerAddresses?.includes(account!) || false
}

/**
 * Gets the language of the user.
 *
 * @returns {string} - The user's language code, defaulting to 'en-US'.
 */
export const language = () => {
  if (typeof navigator === 'undefined') {
    return 'en-US'
  }
  return navigator?.language || 'en-US'
}

/**
 * Extracts event attributes from an Event object.
 *
 * @param event - The event object containing attributes.
 * @returns {EventAttributes} - An object with extracted event attributes.
 */
export const getEventAttributes = (event: any): EventAttributes => {
  const attributes = event?.data?.attributes || []

  const attributeMap: Record<string, keyof EventAttributes> = {
    event_start_date: 'startDate',
    event_start_time: 'startTime',
    event_end_date: 'endDate',
    event_end_time: 'endTime',
    event_timezone: 'timezone',
    event_address: 'address',
    event_location: 'location',
    event_is_in_person: 'isInPerson',
  }

  const defaultAttributes: EventAttributes = {
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: '',
    address: '',
    location: '',
    isInPerson: false,
  }

  return attributes.reduce((acc: any, attribute: any) => {
    const key = attributeMap[attribute.trait_type]
    if (key) {
      // @ts-ignore
      acc[key] = attribute.value
    }
    return acc
  }, defaultAttributes)
}
