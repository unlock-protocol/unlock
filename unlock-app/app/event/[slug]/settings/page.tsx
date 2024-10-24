import { PaywallConfigType } from '@unlock-protocol/core'
import { EventPageProps } from '../page'
import { notFound } from 'next/navigation'
import { EventSettings } from '~/components/content/event/Settings/EventSettings'
import { fetchEventMetadata } from '~/utils/eventMetadata'
import { AuthRequired } from 'app/Components/ProtectedContent'

const SettingsPage = async ({ params }: EventPageProps) => {
  const { slug } = params

  // Fetch the event metadata using the shared function
  const eventMetadata = await fetchEventMetadata(slug)

  if (!eventMetadata) {
    return notFound()
  }

  const checkoutConfig = eventMetadata.checkoutConfig as {
    id?: string
    config: PaywallConfigType
  }

  // we pass the slug to make sure we reload the settings as an authenticated user
  return (
    <AuthRequired>
      <EventSettings
        slug={eventMetadata.slug!}
        checkoutConfig={checkoutConfig}
      />
    </AuthRequired>
  )
}

export default SettingsPage
