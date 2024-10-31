import React from 'react'
import { Metadata } from 'next'
import EventContent from '~/components/content/EventContent'

export const metadata: Metadata = {
  title: 'Unlock Events',
  description:
    'Unlock Protocol empowers everyone to create events the true web3 way. Deploy a contract, sell tickets as NFTs, and perform check-in with a dedicated QR code. We got it covered.',
}

const EventLandingPage: React.FC = () => {
  return <EventContent />
}

export default EventLandingPage
