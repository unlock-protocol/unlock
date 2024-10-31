import React from 'react'
import { Metadata } from 'next'
import EventContent from '~/components/content/EventContent'
import { SHARED_METADATA } from '~/config/seo'

export const metadata: Metadata = {
  ...SHARED_METADATA,
  title: 'Unlock Events',
  description:
    'Unlock Protocol empowers everyone to create events the true web3 way. Deploy a contract, sell tickets as NFTs, and perform check-in with a dedicated QR code. We got it covered.',
  openGraph: {
    ...SHARED_METADATA.openGraph,
    images: [
      {
        alt: 'Event',
        url: 'https://events.unlock-protocol.com/',
      },
    ],
  },
}

const EventLandingPage: React.FC = () => {
  return <EventContent />
}

export default EventLandingPage
