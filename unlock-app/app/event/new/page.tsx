import { ProtectedContent } from 'app/Components/ProtectedContent'
import { Metadata } from 'next'
import React from 'react'
import NewEventContent from '~/components/content/event/NewEvent'

export const metadata: Metadata = {
  title: 'Create a New Event',
  description:
    'Create event tickets and landing pages for your conference, event, or meetup in under five minutes with Unlock Protocol',
}

const NewEventPage: React.FC = () => {
  return (
    <ProtectedContent>
      <NewEventContent />
    </ProtectedContent>
  )
}

export default NewEventPage
