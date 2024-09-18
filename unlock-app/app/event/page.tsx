import React from 'react'
import { Metadata } from 'next'
import EventContent from '~/components/content/EventContent'

export const metadata: Metadata = {
  title: 'Unlock Events',
  description:
    'Create event tickets and landing pages for your conference, event, or meetup in under five minutes with Unlock Protocol.',
}

const EventLandingPage: React.FC = () => {
  return <EventContent />
}

export default EventLandingPage
