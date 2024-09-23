import { locksmith } from '~/config/locksmith'

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
