import { Event } from '@unlock-protocol/unlock-js'
import EventsCollectionDetailContent from '~/components/content/events-collection/EventsCollectionDetailContent'
import { getEventCollection } from '~/utils/eventCollections'

export interface EventCollectionDetail {
  slug: string
  title: string
  description: string
  coverImage?: string
  banner?: string
  links?: Record<string, string>
  managerAddresses: string[]
  createdAt: string
  updatedAt: string
  events: {
    events: Event[]
    totalCount: number
    currentPage: number
    totalPages: number
  }
}

export interface EventCollectionDetailPageProps {
  params: {
    slug: string
  }
}

const EventCollectionDetailPage = async ({
  params,
}: EventCollectionDetailPageProps) => {
  const { slug } = params

  // Fetch the event collection details
  const eventCollection = await getEventCollection(slug)

  return <EventsCollectionDetailContent eventCollection={eventCollection!} />
}

export default EventCollectionDetailPage
