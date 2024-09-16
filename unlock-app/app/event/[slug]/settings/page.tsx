import { PaywallConfigType } from '@unlock-protocol/core'
import { EventPageProps } from '../page'
import { notFound } from 'next/navigation'
import { EventSettings } from '~/components/content/event/Settings/EventSettings'
import { fetchEventMetadata } from '~/utils/eventMetadata'

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
    <EventSettings slug={eventMetadata.slug!} checkoutConfig={checkoutConfig} />
  )
}

export default SettingsPage
