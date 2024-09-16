import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { EventPageProps, fetchEventMetadata } from '../page'
import { toFormData } from 'axios'
import { notFound } from 'next/navigation'
import EventVerification from '~/components/content/event/EventVerification'

const VerificationPage = async ({ params }: EventPageProps) => {
  const { slug } = params

  // Fetch the event metadata using the shared function
  const eventMetadata = await fetchEventMetadata(slug)

  if (!eventMetadata) {
    return notFound()
  }

  // Transform the fetched metadata into the event object
  const event = toFormData({
    ...eventMetadata.data!,
    slug: eventMetadata.slug,
  }) as unknown as Event

  const checkoutConfig = eventMetadata.checkoutConfig as {
    id?: string
    config: PaywallConfigType
  }

  return <EventVerification slug={event.slug} checkoutConfig={checkoutConfig} />
}

export default VerificationPage
