import Attendees from '~/components/content/event/attendees/Attendees'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { EventPageProps } from '../page'
import { toFormData } from 'axios'
import { notFound } from 'next/navigation'
import { fetchEventMetadata } from '~/utils/eventMetadata'
import { AuthRequired } from 'app/Components/ProtectedContent'

const AttendeesPage = async ({ params }: EventPageProps) => {
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

  return (
    <AuthRequired>
      <Attendees
        event={JSON.parse(JSON.stringify(event))}
        checkoutConfig={JSON.parse(JSON.stringify(checkoutConfig))}
      />
    </AuthRequired>
  )
}

export default AttendeesPage
