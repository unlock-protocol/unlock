import { AuthRequired } from 'app/Components/ProtectedContent'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventCollectionSettings } from '~/components/content/events-collection/EventCollectionSettings'
import { getEventCollection } from '~/utils/eventCollections'

export const metadata: Metadata = {
  title: 'Events Collection Settings',
  description: 'Manage your collection settings.',
}

const EventCollectionSettingsPage = async ({
  params,
}: {
  params: { slug: string }
}) => {
  const { slug } = params

  // fetch the event collection details
  const eventCollection = await getEventCollection(slug)

  if (!eventCollection) {
    return notFound()
  }

  return (
    <AuthRequired>
      <EventCollectionSettings eventCollection={eventCollection} />
    </AuthRequired>
  )
}

export default EventCollectionSettingsPage
