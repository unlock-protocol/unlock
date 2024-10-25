import { PaywallConfigType } from '@unlock-protocol/core'
import { EventPageProps } from '../page'
import { notFound } from 'next/navigation'
import EventVerification from '~/components/content/event/EventVerification'
import { fetchEventMetadata } from '~/utils/eventMetadata'
import { AuthRequired } from 'app/Components/ProtectedContent'

const VerificationPage = async ({ params }: EventPageProps) => {
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

  return (
    <AuthRequired>
      <EventVerification
        slug={eventMetadata.slug!}
        checkoutConfig={checkoutConfig}
      />
    </AuthRequired>
  )
}

export default VerificationPage
