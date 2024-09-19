import { locksmith } from '~/config/locksmith'

// Function to fetch event metadata and return it or handle errors
export async function fetchEventMetadata(slug: string) {
  try {
    const { data: eventMetadata } = await locksmith.getEvent(slug)
    return eventMetadata
  } catch (error) {
    console.error(error)
    return null
  }
}
