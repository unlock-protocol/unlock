import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { Event } from '@unlock-protocol/unlock-js'
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
