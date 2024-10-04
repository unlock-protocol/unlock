import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { Event } from '@unlock-protocol/unlock-js'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

// dynamically generate metadata for the event collection
export async function generateMetadata({
  params,
}: EventCollectionDetailPageProps): Promise<Metadata> {
  const { slug } = params

  let eventCollection
  try {
    eventCollection = await getEventCollection(slug)
  } catch (error) {
    return {
      title: 'Event Collection Not Found | Unlock Events',
      description: 'The requested event collection could not be found.',
    }
  }

  const title = `${eventCollection.title} | Unlock Events`

  return {
    title,
    description: eventCollection.description,
    openGraph: {
      title,
      description: eventCollection.description,
      images: [
        {
          url: eventCollection.coverImage || '/default-cover.png',
          width: 1200,
          height: 630,
          alt: eventCollection.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: eventCollection.description,
      images: [eventCollection.coverImage || '/default-cover.png'],
    },
  }
}

const EventCollectionDetailPage = async ({
  params,
}: EventCollectionDetailPageProps) => {
  const { slug } = params
  const queryClient = new QueryClient()

  let eventCollection
  try {
    eventCollection = await getEventCollection(slug)
  } catch (error) {
    notFound()
  }

  if (!eventCollection) {
    notFound()
  }

  // prefetch the event collection details
  await queryClient.prefetchQuery({
    queryKey: ['eventCollectionDetails', slug],
    queryFn: () => getEventCollection(slug),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsCollectionDetailContent slug={slug} />
    </HydrationBoundary>
  )
}

export default EventCollectionDetailPage
