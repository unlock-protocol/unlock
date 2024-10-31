import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { EventContentWithProps } from '~/components/content/EventContent'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { fetchEventMetadata } from '~/utils/eventMetadata'
import { fetchMetadata as fetchFramesMetadata } from 'frames.js/next'
import { config } from '~/config/app'

export interface EventPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = params

  // Fetch the event metadata using the shared function
  const eventMetadata = await fetchEventMetadata(slug)

  // If no event metadata is retrieved, return a default metadata object indicating the event wasn't found
  if (!eventMetadata) {
    return {
      title: 'Event Not Found',
      description: 'The requested event does not exist.',
    }
  }

  // Transform the fetched metadata into a format that matches the `Event` type
  const event = toFormData({
    ...eventMetadata.data!,
    slug: eventMetadata.slug,
  }) as Event

  // Get frames metadata
  const framesMetadata = await fetchFramesMetadata(
    new URL(`/frames/event/${event.slug}/page`, config.unlockApp)
  )

  // Filter out any undefined values from frames metadata
  const filteredFramesMetadata = Object.fromEntries(
    Object.entries(framesMetadata).filter(([_, value]) => value !== undefined)
  )

  // Construct and return the metadata object for the event page, including Open Graph and Twitter card info
  return {
    title: event.name || 'Event',
    description: event.description || '',
    openGraph: {
      title: event.name || 'Event',
      description: event.description || '',
      images: [
        {
          url: event.image || '/default-event-image.png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name || 'Event',
      description: event.description || '',
      images: [event.image || '/default-event-image.png'],
    },
    other: {
      ...filteredFramesMetadata,
      'fc:frame': 'vNext',
      'fc:frame:image': `${config.unlockApp}/og/event/${event.slug}`,
      'fc:frame:post_url': `${config.unlockApp}/frames/event?p=${encodeURIComponent(
        `${config.unlockApp}/frames/event/${event.slug}`
      )}&s=${encodeURIComponent('{"view":"default"}')}`,
      'fc:frame:button:1': 'Register',
      'fc:frame:button:1:target': `${config.unlockApp}/event/${event.slug}`,
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:2': 'See description',
      'fc:frame:button:2:action': 'post',
    },
  }
}

const EventPage = async ({ params }: EventPageProps) => {
  const { slug } = params

  // Fetch the event metadata using the shared function
  const eventMetadata = await fetchEventMetadata(slug)

  if (!eventMetadata) {
    notFound()
  }

  // Transform the fetched metadata into the event object
  const event = toFormData({
    ...eventMetadata.data!,
    slug: eventMetadata.slug,
  }) as Event

  const checkoutConfig = eventMetadata.checkoutConfig as {
    id?: string
    config: PaywallConfigType
  }

  return <EventContentWithProps event={event} checkoutConfig={checkoutConfig} />
}

export default EventPage
